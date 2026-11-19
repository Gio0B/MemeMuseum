require('dotenv').config();

const app = require('./src/app');
const { PORT } = require('./src/config/config');

app.listen(PORT, () => {
    console.log(`Server attivo sulla porta ${PORT}`);
});
