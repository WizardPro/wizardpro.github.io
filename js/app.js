const app = Vue.createApp({
    data() {
        return {
            time: '',
            date: '',
            lunar: '',
            activePanel: null,
            jsonInput: '',
            jsonOutput: '',
            sqlInput: '',
            sqlOutput: '',
            isJsonWrapped: false,
            isSqlWrapped: false,
            showToast: false,
            toastMessage: ''
        }
    },
    methods: {
        updateTime() {
            const now = new Date();
            
            // 更新时间
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            this.time = `${hours}:${minutes}`;
            
            // 更新日期
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            const weekday = weekdays[now.getDay()];
            this.date = `${year}年${month}月${day}日 ${weekday}`;
            
            // 更新农历
            const lunar = calendar.solar2lunar(year, parseInt(month), parseInt(day));
            this.lunar = `农历${lunar.IMonthCn}${lunar.IDayCn}`;
        },
        showPanel(type) {
            this.activePanel = type;
        },
        closePanel() {
            this.activePanel = null;
        },
        formatJSON() {
            try {
                const parsed = JSON.parse(this.jsonInput);
                this.jsonOutput = JSON.stringify(parsed, null, 4);
                this.showToastMessage('格式化成功');
            } catch (e) {
                this.showToastMessage('无效的 JSON 格式');
            }
        },
        formatSQL() {
            try {
                let sql = this.sqlInput.trim();
                
                // 替换多余的空白字符
                sql = sql.replace(/\s+/g, ' ');
                
                // 大写关键字
                const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'ON', 'IN', 'LIKE', 'LIMIT', 'OFFSET', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION', 'TRIGGER'];
                
                keywords.forEach(keyword => {
                    const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
                    sql = sql.replace(regex, keyword);
                });
                
                // 在主要关键字前添加换行
                const mainKeywords = ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT'];
                mainKeywords.forEach(keyword => {
                    sql = sql.replace(new RegExp('\\b' + keyword + '\\b', 'g'), '\n' + keyword);
                });
                
                // 处理 JOIN 语句
                const joinKeywords = ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'JOIN'];
                joinKeywords.forEach(keyword => {
                    sql = sql.replace(new RegExp('\\b' + keyword + '\\b', 'g'), '\n  ' + keyword);
                });
                
                // 处理 AND 和 OR
                sql = sql.replace(/\bAND\b/g, '\n  AND');
                sql = sql.replace(/\bOR\b/g, '\n  OR');
                
                // 格式化括号
                sql = sql.replace(/\(/g, ' (');
                sql = sql.replace(/\)/g, ') ');
                
                // 删除多余的空格和换行
                sql = sql.replace(/\s+/g, ' ').trim();
                sql = sql.replace(/\n\s*/g, '\n');
                
                this.sqlOutput = sql.trim();
                this.showToastMessage('格式化成功');
            } catch (e) {
                this.showToastMessage('格式化失败');
            }
        },
        toggleJsonWrap() {
            this.isJsonWrapped = !this.isJsonWrapped;
            const pre = document.querySelector('#jsonOutput');
            if (this.isJsonWrapped) {
                pre.classList.add('wrap');
            } else {
                pre.classList.remove('wrap');
            }
        },
        toggleSqlWrap() {
            this.isSqlWrapped = !this.isSqlWrapped;
            const pre = document.querySelector('#sqlOutput');
            if (this.isSqlWrapped) {
                pre.classList.add('wrap');
            } else {
                pre.classList.remove('wrap');
            }
        },
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToastMessage('已复制到剪贴板');
            }).catch(() => {
                this.showToastMessage('复制失败');
            });
        },
        clearContent(type) {
            if (type === 'json') {
                this.jsonInput = '';
                this.jsonOutput = '';
            } else if (type === 'sql') {
                this.sqlInput = '';
                this.sqlOutput = '';
            }
        },
        showToastMessage(message) {
            this.toastMessage = message;
            this.showToast = true;
            setTimeout(() => {
                this.showToast = false;
            }, 2000);
        }
    },
    mounted() {
        this.updateTime();
        setInterval(this.updateTime, 1000);
        
        // 添加 ESC 键关闭面板
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePanel();
            }
        });
    }
});

app.mount('#app');