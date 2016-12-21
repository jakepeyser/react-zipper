const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
const PATHS = {
  indexHTML: path.join(__dirname, '../browser/build/index.html'),
  build: path.join(__dirname, '../browser/build')
}
const PORT = process.env.PORT || 8080;
const chalk = require('chalk');

// Logging, static, and body-parser middleware
app.use(morgan('dev'));
app.use(express.static(PATHS.build));

// Handle API and all browser requests
app.get('/*', (req, res) => res.sendFile(PATHS.indexHTML));

// Error handler
app.use((err, req, res, next) => {
  console.error(chalk.red(err));
  console.error(chalk.red(err.stack))
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});

// Start server
app.listen(PORT, () =>
  console.log(chalk.blue(`Server started on port ${chalk.magenta(PORT)}`))
);
