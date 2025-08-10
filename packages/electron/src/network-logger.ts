import { ipcMain, net, BrowserWindow } from 'electron';

interface NetworkLog {
    timestamp: string;
    type: 'request' | 'response' | 'error';
    method?: string;
    url: string;
    status?: number;
    headers?: Record<string, string>;
    body?: any;
    error?: string;
    duration?: number;
}

class NetworkLogger {
    private logs: NetworkLog[] = [];
    private maxLogs = 1000;
    private enabled = true;

    constructor() {
        this.setupIpcHandlers();
    }

    private setupIpcHandlers() {
        // 获取所有网络日志
        ipcMain.handle('network:get-logs', () => {
            return this.logs;
        });

        // 清除日志
        ipcMain.handle('network:clear-logs', () => {
            this.logs = [];
            return { success: true };
        });

        // 启用/禁用日志
        ipcMain.handle('network:toggle-logging', (_, enabled: boolean) => {
            this.enabled = enabled;
            return { success: true, enabled: this.enabled };
        });

        // 导出日志到文件
        ipcMain.handle('network:export-logs', () => {
            const fs = require('fs');
            const path = require('path');
            const logFile = path.join(
                require('electron').app.getPath('downloads'),
                `network-logs-${Date.now()}.json`
            );
            
            fs.writeFileSync(logFile, JSON.stringify(this.logs, null, 2));
            return { success: true, path: logFile };
        });
    }

    logRequest(method: string, url: string, headers?: Record<string, string>, body?: any) {
        if (!this.enabled) return;

        const log: NetworkLog = {
            timestamp: new Date().toISOString(),
            type: 'request',
            method,
            url,
            headers,
            body
        };

        this.addLog(log);
        console.log(`[Network Request] ${method} ${url}`, headers, body);
    }

    logResponse(url: string, status: number, headers?: Record<string, string>, body?: any, duration?: number) {
        if (!this.enabled) return;

        const log: NetworkLog = {
            timestamp: new Date().toISOString(),
            type: 'response',
            url,
            status,
            headers,
            body,
            duration
        };

        this.addLog(log);
        console.log(`[Network Response] ${status} ${url} (${duration}ms)`, headers, body);
    }

    logError(url: string, error: string) {
        if (!this.enabled) return;

        const log: NetworkLog = {
            timestamp: new Date().toISOString(),
            type: 'error',
            url,
            error
        };

        this.addLog(log);
        console.error(`[Network Error] ${url}: ${error}`);
    }

    private addLog(log: NetworkLog) {
        this.logs.push(log);
        
        // 限制日志数量
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // 发送日志到渲染进程（如果有窗口打开）
        const windows = BrowserWindow.getAllWindows();
        windows.forEach(win => {
            win.webContents.send('network:log-added', log);
        });
    }

    getLogs() {
        return this.logs;
    }

    clearLogs() {
        this.logs = [];
    }
}

export const networkLogger = new NetworkLogger();

// 拦截并记录所有 net.request 请求
export function wrapNetRequest(originalRequest: typeof net.request): typeof net.request {
    return function(options: any) {
        const startTime = Date.now();
        const request = originalRequest(options);
        
        // 记录请求
        networkLogger.logRequest(
            options.method || 'GET',
            typeof options === 'string' ? options : options.url,
            options.headers,
            undefined
        );

        // 监听响应
        request.on('response', (response: any) => {
            let responseBody = '';
            
            response.on('data', (chunk: Buffer) => {
                responseBody += chunk.toString();
            });

            response.on('end', () => {
                const duration = Date.now() - startTime;
                networkLogger.logResponse(
                    typeof options === 'string' ? options : options.url,
                    response.statusCode,
                    response.headers,
                    responseBody.length > 1000 ? responseBody.substring(0, 1000) + '...' : responseBody,
                    duration
                );
            });
        });

        // 监听错误
        request.on('error', (error: Error) => {
            networkLogger.logError(
                typeof options === 'string' ? options : options.url,
                error.message
            );
        });

        return request;
    };
}
