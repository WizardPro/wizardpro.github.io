const { createApp } = Vue;

createApp({
    data() {
        return {
            time: '',
            date: '',
            lunar: '',
            activePanel: '',
            jsonInput: '',
            jsonOutput: '',
            sqlInput: '',
            sqlOutput: '',
            isJsonWrapped: true,
            isSqlWrapped: true,
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
            const seconds = String(now.getSeconds()).padStart(2, '0');
            this.time = `${hours}:${minutes}:${seconds}`;
            
            // 更新日期
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            const weekDay = weekDays[now.getDay()];
            this.date = `${year}年${month}月${day}日 ${weekDay}`;
            
            // 更新农历
            const lunar = Lunar.fromDate(now);
            this.lunar = lunar.getYearInChinese() + '年' + 
                        lunar.getMonthInChinese() + '月' +
                        lunar.getDayInChinese();
        },
        showPanel(type) {
            this.activePanel = type;
        },
        closePanel() {
            this.activePanel = '';
        },
        formatJSON() {
            try {
                const parsed = JSON.parse(this.jsonInput.trim() || '{}');
                this.jsonOutput = JSON.stringify(parsed, null, 2);
                this.showToastMessage('格式化成功');
            } catch (e) {
                this.showToastMessage('JSON格式错误');
            }
        },
        formatSQL() {
            let sql = this.sqlInput.trim();
            if (!sql) {
                this.sqlOutput = '';
                return;
            }

            // 统一换行和空格
            sql = sql.replace(/\s+/g, ' ');

            // 主要关键字
            const keywords = [
                'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY',
                'LIMIT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'
            ];

            // 次要关键字
            const subKeywords = [
                'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'JOIN',
                'AND', 'OR', 'ON', 'AS'
            ];

            // 大写所有关键字
            keywords.forEach(keyword => {
                const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
                sql = sql.replace(regex, keyword);
            });

            subKeywords.forEach(keyword => {
                const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
                sql = sql.replace(regex, keyword);
            });

            // 添加换行和缩进
            keywords.forEach(keyword => {
                sql = sql.replace(new RegExp('\\b' + keyword + '\\b', 'g'), '\n' + keyword);
            });

            subKeywords.forEach(keyword => {
                sql = sql.replace(new RegExp('\\b' + keyword + '\\b', 'g'), '\n  ' + keyword);
            });

            // 处理括号
            sql = sql.replace(/\(/g, '\n(');
            sql = sql.replace(/\)/g, ')\n');

            // 清理多余的换行和空格
            sql = sql.replace(/\s*\n\s*/g, '\n');
            sql = sql.replace(/\n+/g, '\n');
            sql = sql.trim();

            this.sqlOutput = sql;
            this.showToastMessage('格式化成功');
        },
        toggleJsonWrap() {
            this.isJsonWrapped = !this.isJsonWrapped;
        },
        toggleSqlWrap() {
            this.isSqlWrapped = !this.isSqlWrapped;
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
        async copyToClipboard(text) {
            try {
                await navigator.clipboard.writeText(text);
                this.showToastMessage('复制成功');
            } catch (err) {
                this.showToastMessage('复制失败');
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
    }
}).mount('#app');