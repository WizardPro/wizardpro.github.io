const app = Vue.createApp({
    data() {
        return {
            time: '',
            date: '',
            lunar: '',
            currentTool: null,
            jsonInput: '',
            jsonOutput: '',
            sqlInput: '',
            sqlOutput: '',
            jsonWrap: false,
            sqlWrap: false,
            showToast: false,
            toastMessage: '',
            toastTimer: null
        }
    },
    watch: {
        jsonInput: function(val) {
            if (val.trim()) {
                this.formatJSON();
            } else {
                this.jsonOutput = '';
            }
        },
        sqlInput: function(val) {
            if (val.trim()) {
                this.formatSQL();
            } else {
                this.sqlOutput = '';
            }
        }
    },
    methods: {
        updateTime() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            this.time = `${hours}:${minutes}:${seconds}`;
            
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            const weekday = weekdays[now.getDay()];
            this.date = `${year}年${month}月${day}日 ${weekday}`;
            
            this.lunar = '农历 ' + lunarCalendar.lunar(year, parseInt(month), parseInt(day));
        },
        
        showToastMessage(message) {
            if (this.toastTimer) {
                clearTimeout(this.toastTimer);
            }
            this.toastMessage = message;
            this.showToast = true;
            this.toastTimer = setTimeout(() => {
                this.showToast = false;
            }, 2000);
        },
        
        openTool(tool) {
            this.currentTool = tool;
            if (tool === 'json') {
                this.jsonInput = '';
                this.jsonOutput = '';
            } else if (tool === 'sql') {
                this.sqlInput = '';
                this.sqlOutput = '';
            }
            document.body.style.overflow = 'hidden';
        },
        
        closeTool() {
            this.currentTool = null;
            document.body.style.overflow = '';
        },
        
        formatJSON() {
            try {
                if (!this.jsonInput.trim()) {
                    this.jsonOutput = '';
                    return;
                }
                const parsed = JSON.parse(this.jsonInput);
                this.jsonOutput = JSON.stringify(parsed, null, 2);
                this.$nextTick(() => {
                    Prism.highlightAll();
                });
            } catch (e) {
                this.jsonOutput = `错误: ${e.message}`;
            }
        },
        
        formatSQL() {
            try {
                this.sqlOutput = sqlFormatter.format(this.sqlInput);
                this.$nextTick(() => {
                    Prism.highlightAll();
                });
            } catch (e) {
                this.sqlOutput = `错误: ${e.message}`;
            }
        },
        
        copyToClipboard(type) {
            const content = type === 'json' ? this.jsonOutput : this.sqlOutput;
            if (!content) return;
            
            navigator.clipboard.writeText(content)
                .then(() => {
                    this.showToastMessage('复制成功');
                })
                .catch(err => {
                    console.error('复制失败:', err);
                    this.showToastMessage('复制失败，请手动复制');
                });
        },
        
        clearJSON() {
            this.jsonInput = '';
            this.jsonOutput = '';
        },
        
        clearSQL() {
            this.sqlInput = '';
            this.sqlOutput = '';
        },
        
        toggleWrap(type) {
            if (type === 'json') {
                this.jsonWrap = !this.jsonWrap;
            } else if (type === 'sql') {
                this.sqlWrap = !this.sqlWrap;
            }
            this.$nextTick(() => {
                Prism.highlightAll();
            });
        }
    },
    mounted() {
        this.updateTime();
        setInterval(this.updateTime, 1000);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentTool) {
                this.closeTool();
            }
        });
    }
}).mount('#app');