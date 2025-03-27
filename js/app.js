const app = Vue.createApp({
    data() {
        return {
            time: '',
            date: '',
            lunar: '',
            currentTool: null,
            jsonInput: '',
            jsonOutput: ''
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
            const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            const weekday = weekdays[now.getDay()];
            this.date = `${year}年${month}月${day}日 ${weekday}`;
            
            // 更新农历
            const lunar = calendar.solar2lunar(year, parseInt(month), parseInt(day));
            this.lunar = `农历${lunar.IMonthCn}${lunar.IDayCn}`;
        },
        
        openTool(tool) {
            this.currentTool = tool;
            this.jsonInput = '';
            this.jsonOutput = '';
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
                
                // 触发代码高亮
                this.$nextTick(() => {
                    Prism.highlightAll();
                });
            } catch (e) {
                this.jsonOutput = `错误: ${e.message}`;
            }
        },
        
        copyToClipboard() {
            if (!this.jsonOutput) return;
            
            navigator.clipboard.writeText(this.jsonOutput)
                .then(() => {
                    alert('已复制到剪贴板');
                })
                .catch(err => {
                    console.error('复制失败:', err);
                    alert('复制失败，请手动复制');
                });
        },
        
        clearJSON() {
            this.jsonInput = '';
            this.jsonOutput = '';
        }
    },
    mounted() {
        // 启动时钟
        this.updateTime();
        setInterval(this.updateTime, 1000);
        
        // 添加ESC键关闭工具面板
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentTool) {
                this.closeTool();
            }
        });
    }
}).mount('#app');