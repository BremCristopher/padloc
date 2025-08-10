import {
    CryptoProvider,
    PBKDF2Params,
    AESKey,
    RSAPublicKey,
    RSAPrivateKey,
    HMACKey,
    SymmetricKey,
    AESKeyParams,
    RSAKeyParams,
    HMACParams,
    HMACKeyParams,
    AESEncryptionParams,
    RSAEncryptionParams,
    HashParams,
    RSASigningParams,
} from "@padloc/core/src/crypto";
import { Err, ErrorCode } from "@padloc/core/src/error";
import SJCLProvider from "@padloc/core/src/sjcl";

const webCrypto = window.crypto && window.crypto.subtle;

export class WebCryptoProvider implements CryptoProvider {
    async randomBytes(n: number): Promise<Uint8Array> {
        const bytes = window.crypto.getRandomValues(new Uint8Array(n));
        return bytes;
    }

    async hash(input: Uint8Array, params: HashParams): Promise<Uint8Array> {
        const bytes = await webCrypto.digest({ name: params.algorithm }, input as any);
        return new Uint8Array(bytes);
    }

    generateKey(params: AESKeyParams): Promise<AESKey>;
    generateKey(params: RSAKeyParams): Promise<{ privateKey: RSAPrivateKey; publicKey: RSAPublicKey }>;
    generateKey(params: HMACKeyParams): Promise<HMACKey>;
    async generateKey(
        params: AESKeyParams | RSAKeyParams | HMACKeyParams
    ): Promise<AESKey | HMACKey | { privateKey: RSAPrivateKey; publicKey: RSAPublicKey }> {
        switch (params.algorithm) {
            case "AES":
            case "HMAC":
                return this.randomBytes(params.keySize / 8);
            case "RSA":
                const keyPair = (await webCrypto.generateKey(Object.assign(params, { name: "RSA-OAEP" }), true, [
                    "encrypt",
                    "decrypt",
                ])) as CryptoKeyPair;

                const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey!);
                const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey!);

                return {
                    privateKey: new Uint8Array(privateKey),
                    publicKey: new Uint8Array(publicKey),
                };
            default:
                throw new Err(ErrorCode.NOT_SUPPORTED);
        }
    }

    async deriveKey(password: Uint8Array, params: PBKDF2Params): Promise<SymmetricKey> {
        const baseKey = await webCrypto.importKey("raw", password as any, params.algorithm, false, ["deriveBits"]);

        const key = await webCrypto.deriveBits(
            {
                name: params.algorithm,
                salt: new Uint8Array(params.salt!),
                iterations: params.iterations,
                hash: params.hash,
            },
            baseKey,
            params.keySize
        );

        return new Uint8Array(key);
    }

    encrypt(key: AESKey, data: Uint8Array, params: AESEncryptionParams): Promise<Uint8Array>;
    encrypt(publicKey: RSAPublicKey, data: Uint8Array, params: RSAEncryptionParams): Promise<Uint8Array>;
    async encrypt(
        key: AESKey | RSAPublicKey,
        data: Uint8Array,
        params: AESEncryptionParams | RSAEncryptionParams
    ): Promise<Uint8Array> {
        switch (params.algorithm) {
            case "AES-GCM":
            case "AES-CCM":
                return this._encryptAES(key, data, params);
            case "RSA-OAEP":
                return this._encryptRSA(key, data, params);
            default:
                throw new Err(ErrorCode.INVALID_ENCRYPTION_PARAMS);
        }
    }

    decrypt(key: AESKey, data: Uint8Array, params: AESEncryptionParams): Promise<Uint8Array>;
    decrypt(publicKey: RSAPublicKey, data: Uint8Array, params: RSAEncryptionParams): Promise<Uint8Array>;
    async decrypt(
        key: AESKey | RSAPublicKey,
        data: Uint8Array,
        params: AESEncryptionParams | RSAEncryptionParams
    ): Promise<Uint8Array> {
        switch (params.algorithm) {
            case "AES-GCM":
            case "AES-CCM":
                return this._decryptAES(key, data, params);
            case "RSA-OAEP":
                return this._decryptRSA(key, data, params);
            default:
                throw new Err(ErrorCode.INVALID_ENCRYPTION_PARAMS);
        }
    }

    async timingSafeEqual(a: Uint8Array, b: Uint8Array): Promise<boolean> {
        const compareKey = await this.generateKey(new HMACKeyParams());
        const hmacA = await this.sign(compareKey, a, new HMACParams());
        const hmacB = await this.sign(compareKey, b, new HMACParams());

        let match = true;

        for (let i = 0; i < hmacA.length; i++) {
            match = match && hmacA[i] === hmacB[i];
        }

        return hmacA.length === hmacB.length && match;
    }

    private async _encryptAES(key: AESKey, data: Uint8Array, params: AESEncryptionParams): Promise<Uint8Array> {
        if (params.algorithm === "AES-CCM") {
            return SJCLProvider.encrypt(key, data, params);
        }

        const k = await webCrypto.importKey("raw", key as any, params.algorithm, false, ["encrypt"]);

        try {
            const buf = await webCrypto.encrypt(
                {
                    name: params.algorithm,
                    iv: new Uint8Array(params.iv!),
                    additionalData: params.additionalData ? new Uint8Array(params.additionalData) : undefined,
                    tagLength: params.tagSize,
                },
                k,
                data as any
            );

            return new Uint8Array(buf);
        } catch (e) {
            throw new Err(ErrorCode.ENCRYPTION_FAILED);
        }
    }

    private async _decryptAES(key: AESKey, data: Uint8Array, params: AESEncryptionParams): Promise<Uint8Array> {
        if (params.algorithm === "AES-CCM") {
            return SJCLProvider.decrypt(key, data, params);
        }

        const k = await webCrypto.importKey("raw", key as any, params.algorithm, false, ["decrypt"]);

        try {
            const buf = await webCrypto.decrypt(
                {
                    name: params.algorithm,
                    iv: new Uint8Array(params.iv!),
                    additionalData: params.additionalData ? new Uint8Array(params.additionalData) : undefined,
                    tagLength: params.tagSize,
                },
                k,
                data as any
            );

            return new Uint8Array(buf);
        } catch (e) {
            throw new Err(ErrorCode.DECRYPTION_FAILED);
        }
    }

    async _encryptRSA(publicKey: RSAPublicKey, key: AESKey, params: RSAEncryptionParams) {
        const p = Object.assign({}, params, { name: params.algorithm });
        const k = await webCrypto.importKey("spki", publicKey as any, p, false, ["encrypt"]);
        try {
            const buf = await webCrypto.encrypt(p, k, key as any);
            return new Uint8Array(buf);
        } catch (e) {
            throw new Err(ErrorCode.DECRYPTION_FAILED);
        }
    }

    async _decryptRSA(privateKey: RSAPrivateKey, key: AESKey, params: RSAEncryptionParams) {
        const p = Object.assign({}, params, { name: params.algorithm });
        const k = await webCrypto.importKey("pkcs8", privateKey as any, p, false, ["decrypt"]);
        try {
            const buf = await webCrypto.decrypt(p, k, key as any);
            return new Uint8Array(buf);
        } catch (e) {
            throw new Err(ErrorCode.DECRYPTION_FAILED);
        }
    }

    async fingerprint(key: RSAPublicKey): Promise<Uint8Array> {
        const bytes = await webCrypto.digest("SHA-256", key as any);
        return new Uint8Array(bytes);
    }

    async sign(key: HMACKey, data: Uint8Array, params: HMACParams): Promise<Uint8Array>;
    async sign(key: RSAPrivateKey, data: Uint8Array, params: RSASigningParams): Promise<Uint8Array>;
    async sign(
        key: HMACKey | RSAPrivateKey,
        data: Uint8Array,
        params: HMACParams | RSASigningParams
    ): Promise<Uint8Array> {
        switch (params.algorithm) {
            case "HMAC":
                return this._signHMAC(key, data, params);
            case "RSA-PSS":
                return this._signRSA(key, data, params);
            default:
                throw new Err(ErrorCode.NOT_SUPPORTED);
        }
    }

    async verify(key: HMACKey, signature: Uint8Array, data: Uint8Array, params: HMACParams): Promise<boolean>;
    async verify(
        key: RSAPrivateKey,
        signature: Uint8Array,
        data: Uint8Array,
        params: RSASigningParams
    ): Promise<boolean>;
    async verify(
        key: HMACKey | RSAPrivateKey,
        signature: Uint8Array,
        data: Uint8Array,
        params: HMACParams | RSASigningParams
    ): Promise<boolean> {
        switch (params.algorithm) {
            case "HMAC":
                return this._verifyHMAC(key, signature, data, params);
            case "RSA-PSS":
                return this._verifyRSA(key, signature, data, params);
            default:
                throw new Err(ErrorCode.NOT_SUPPORTED);
        }
    }

    private async _signHMAC(key: HMACKey, data: Uint8Array, params: HMACParams): Promise<Uint8Array> {
        const p = Object.assign({}, params, { name: params.algorithm, length: params.keySize });
        const k = await webCrypto.importKey("raw", key as any, p, false, ["sign"]);
        const signature = await webCrypto.sign(p, k, data as any);
        return new Uint8Array(signature);
    }

    private async _verifyHMAC(
        key: HMACKey,
        signature: Uint8Array,
        data: Uint8Array,
        params: HMACParams
    ): Promise<boolean> {
        const p = Object.assign({}, params, { name: params.algorithm, length: params.keySize });
        const k = await webCrypto.importKey("raw", key as any, p, false, ["verify"]);
        return await webCrypto.verify(p, k, signature as any, data as any);
    }

    private async _signRSA(key: RSAPrivateKey, data: Uint8Array, params: RSASigningParams): Promise<Uint8Array> {
        const p = Object.assign({}, params, { name: params.algorithm });
        const k = await webCrypto.importKey("pkcs8", key as any, p, false, ["sign"]);
        const signature = await webCrypto.sign(p, k, data as any);
        return new Uint8Array(signature);
    }

    private async _verifyRSA(
        key: RSAPublicKey,
        signature: Uint8Array,
        data: Uint8Array,
        params: RSASigningParams
    ): Promise<boolean> {
        const p = Object.assign({}, params, { name: params.algorithm });
        const k = await webCrypto.importKey("spki", key as any, p, false, ["verify"]);
        return await webCrypto.verify(p, k, signature as any, data as any);
    }
}

export default WebCryptoProvider;
