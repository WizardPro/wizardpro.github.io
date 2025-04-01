document.addEventListener('DOMContentLoaded', function() {
    // 初始化代码高亮
    if (typeof hljs !== 'undefined') {
        hljs.configure({
            languages: ['json', 'sql']
        });
    }

    // 初始化农历Worker
    const lunarWorker = new Worker('js/lunar.worker.js');
    
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
            toastTimer: null,
            autoFormatDelay: null,
            isDarkTheme: true,
            lunarInfo: {},
            showThemeToggle: false
        },
        computed: {
            themeClass() {
                return this.isDarkTheme ? 'theme-dark' : 'theme-light';
            }
        },
        mounted() {
            this.updateTime();
            setInterval(this.updateTime, 1000);
            
            // 添加键盘快捷键
            document.addEventListener('keydown', this.handleKeydown);
            
            // 初始化主题
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                this.isDarkTheme = savedTheme === 'dark';
            }
            
            // 监听Worker消息
            lunarWorker.onmessage = (e) => {
                this.lunarInfo = e.data;
                this.updateLunarDisplay();
            };
        },
        beforeDestroy() {
            document.removeEventListener('keydown', this.handleKeydown);
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
                    
                    // 使用Worker计算农历
                    lunarWorker.postMessage({ date: now.toISOString() });
                } catch (error) {
                    console.error('Error updating time:', error);
                }
            },
            updateLunarDisplay() {
                let result = '';
                if (this.lunarInfo.isLeap) {
                    result += '闰';
                }
                result += ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"][this.lunarInfo.month - 1] + '月';
                result += ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
                          "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
                          "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"][this.lunarInfo.day - 1];
                
                if (this.lunarInfo.solarTerm) {
                    result += ' ' + this.lunarInfo.solarTerm;
                }
                
                this.lunar = result;
            },
            handleKeydown(e) {
                // Ctrl + J: 格式化JSON
                if (e.ctrlKey && e.key === 'j') {
                    e.preventDefault();
                    if (this.showJsonTool) {
                        this.formatJSON();
                    }
                }
                // Ctrl + S: 格式化SQL
                else if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    if (this.showSqlTool) {
                        this.formatSQL();
                    }
                }
                // Esc: 关闭工具面板
                else if (e.key === 'Escape') {
                    this.showJsonTool = false;
                    this.showSqlTool = false;
                }
            },
            toggleTheme() {
                this.isDarkTheme = !this.isDarkTheme;
                localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
            },
            autoFormatJSON() {
                if (this.autoFormatDelay) {
                    clearTimeout(this.autoFormatDelay);
                }
                this.autoFormatDelay = setTimeout(() => {
                    if (this.jsonInput.trim()) {
                        this.formatJSON();
                    }
                }, 500);
            },
            autoFormatSQL() {
                if (this.autoFormatDelay) {
                    clearTimeout(this.autoFormatDelay);
                }
                this.autoFormatDelay = setTimeout(() => {
                    if (this.sqlInput.trim()) {
                        this.formatSQL();
                    }
                }, 500);
            },
            formatJSON() {
                try {
                    if (!this.jsonInput.trim()) {
                        this.jsonOutput = '';
                        return;
                    }
                    const parsed = JSON.parse(this.jsonInput);
                    this.jsonOutput = JSON.stringify(parsed, null, 2);
                    if (typeof hljs !== 'undefined') {
                        this.$nextTick(() => {
                            hljs.highlightElement(this.$refs.jsonOutput);
                        });
                    }
                    this.showToastMessage('格式化成功');
                } catch (error) {
                    this.jsonOutput = '错误：无效的 JSON 格式';
                    this.showToastMessage('格式化失败：无效的 JSON 格式');
                }
            },
            formatSQL() {
                try {
                    if (!this.sqlInput.trim()) {
                        this.sqlOutput = '';
                        return;
                    }
                    let sql = this.sqlInput.trim();
                    
                    // 转换关键字为大写
                    const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 
                                   'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'UPDATE', 
                                   'DELETE', 'CREATE', 'ALTER', 'DROP', 'AND', 'OR', 'IN', 'BETWEEN', 'LIKE', 
                                   'IS', 'NULL', 'NOT', 'DISTINCT'];
                    
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
                    if (typeof hljs !== 'undefined') {
                        this.$nextTick(() => {
                            hljs.highlightElement(this.$refs.sqlOutput);
                        });
                    }
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