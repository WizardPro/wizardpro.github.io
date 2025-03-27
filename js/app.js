const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            time: '',
            date: '',
            jsonInput: '',
            jsonOutput: '',
            week: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            currentTool: null
        }
    },
    mounted() {
        this.updateTime();
        setInterval(this.updateTime, 1000);
        
        // 添加ESC键关闭面板
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTool();
            }
        });
    },
    methods: {
        updateTime() {
            const now = new Date();
            
            // 更新时间
            this.time = [
                now.getHours().toString().padStart(2, '0'),
                now.getMinutes().toString().padStart(2, '0'),
                now.getSeconds().toString().padStart(2, '0')
            ].join(':');
            
            // 更新日期
            this.date = [
                now.getFullYear(),
                (now.getMonth() + 1).toString().padStart(2, '0'),
                now.getDate().toString().padStart(2, '0')
            ].join('-') + ' ' + this.week[now.getDay()];
        },
        openTool(toolName) {
            this.currentTool = toolName;
            // 工具打开时重置内容
            if (toolName === 'json') {
                this.jsonInput = '';
                this.jsonOutput = '';
            }
        },
        closeTool() {
            this.currentTool = null;
        },
        formatJSON() {
            try {
                if (!this.jsonInput.trim()) {
                    this.jsonOutput = '';
                    return;
                }
                
                // 尝试解析JSON
                const parsed = JSON.parse(this.jsonInput);
                // 格式化输出
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
                    alert('已复制到剪贴板！');
                })
                .catch(err => {
                    console.error('复制失败:', err);
                    alert('复制失败，请手动复制。');
                });
        },
        clearJSON() {
            this.jsonInput = '';
            this.jsonOutput = '';
        }
    }
}).mount('#app');