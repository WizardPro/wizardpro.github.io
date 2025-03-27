document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // 确保Vue已加载
    if (typeof Vue === 'undefined') {
        console.error('Vue is not loaded!');
        return;
    }

    // 确保Lunar已加载
    if (typeof Lunar === 'undefined') {
        console.error('Lunar is not loaded!');
        return;
    }

    new Vue({
        el: '#app',
        data: {
            time: '',
            date: '',
            lunar: '',
            showJsonTool: false,
            showSqlTool: false,
            jsonInput: '',
            jsonOutput: '',
            sqlInput: '',
            sqlOutput: '',
            jsonWrap: false,
            sqlWrap: false,
            showToast: false,
            toastMessage: '',
            toastTimer: null
        },
        mounted() {
            this.updateTime();
            setInterval(this.updateTime, 1000);
        },
        methods: {
            updateTime() {
                try {
                    const now = new Date();
                    
                    // 更新时间
                    this.time = now.toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    });
                    
                    // 更新日期
                    this.date = now.getFullYear() + '年' + 
                               String(now.getMonth() + 1).padStart(2, '0') + '月' +
                               String(now.getDate()).padStart(2, '0') + '日 星期' +
                               '日一二三四五六'.charAt(now.getDay());
                    
                    // 更新农历
                    const lunar = new Lunar(now);
                    this.lunar = lunar.toString();
                } catch (error) {
                    console.error('Error updating time:', error);
                }
            },
            formatJSON() {
                try {
                    const parsed = JSON.parse(this.jsonInput);
                    this.jsonOutput = JSON.stringify(parsed, null, 2);
                    this.showToastMessage('格式化成功');
                } catch (error) {
                    this.jsonOutput = '错误：无效的 JSON 格式';
                    this.showToastMessage('格式化失败：无效的 JSON 格式');
                }
            },
            formatSQL() {
                try {
                    let sql = this.sqlInput.trim();
                    
                    // 转换关键字为大写
                    const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'AND', 'OR', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL', 'NOT', 'DISTINCT'];
                    
                    keywords.forEach(keyword => {
                        const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
                        sql = sql.replace(regex, keyword);
                    });
                    
                    // 在主要关键字前添加换行
                    sql = sql.replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT)\b/g, '\n$1');
                    
                    // 缩进子句
                    sql = sql.replace(/\b(JOIN|AND|OR)\b/g, '\n  $1');
                    
                    // 格式化括号
                    sql = sql.replace(/\(/g, '\n(');
                    sql = sql.replace(/\)/g, ')\n');
                    
                    // 清理多余的空白字符
                    sql = sql.replace(/\s+/g, ' ').trim();
                    sql = sql.replace(/\n\s*/g, '\n');
                    sql = sql.replace(/\n+/g, '\n');
                    
                    this.sqlOutput = sql;
                    this.showToastMessage('格式化成功');
                } catch (error) {
                    this.sqlOutput = '错误：SQL 格式化失败';
                    this.showToastMessage('格式化失败');
                }
            },
            copyJsonOutput() {
                this.copyToClipboard(this.jsonOutput);
            },
            copySqlOutput() {
                this.copyToClipboard(this.sqlOutput);
            },
            copyToClipboard(text) {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    this.showToastMessage('复制成功');
                } catch (err) {
                    this.showToastMessage('复制失败');
                }
                document.body.removeChild(textarea);
            },
            clearJson() {
                this.jsonInput = '';
                this.jsonOutput = '';
                this.showToastMessage('已清空');
            },
            clearSql() {
                this.sqlInput = '';
                this.sqlOutput = '';
                this.showToastMessage('已清空');
            },
            showToastMessage(message) {
                this.toastMessage = message;
                this.showToast = true;
                
                if (this.toastTimer) {
                    clearTimeout(this.toastTimer);
                }
                
                this.toastTimer = setTimeout(() => {
                    this.showToast = false;
                }, 2000);
            }
        }
    });
});