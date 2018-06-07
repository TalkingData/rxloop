# 与 RxJS 集成

## 将 rxloop 串联到 RxJS 数据流中
```javascript
// 输入数据
fromEvent(button, 'click')
.pipe(
  map((data) => {
    return {
      type: 'counter/increment',
      data,
    };
  }),
)
.subscribe(app);

// 输出
app.counter$.pipe(
  map(() => {
    return {};
  }),
)
.subscribe((data) => {
  // this.setState(data);  
});
```