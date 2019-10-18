import rxloop, { RxLoopInstance } from '../../';
import user from './user';

const app: RxLoopInstance = rxloop();

app.model(user);
app.start();

export default app;
