const fs = require('fs');
const filesList = fs.readdirSync(`${__dirname}`);

/**
 * Auto import
 * format { fileName: module }
 */
const modules = {
    ...filesList.reduce((acc, fullFileName) => {
    const [ fileName, extension ] = fullFileName.split('.');

    if (fileName === 'index' || extension !== 'js') {
      return acc;
    }

    return {
      ...acc,
      [fileName]: require(`./${fullFileName}`)
    };
  }, {})
};

module.exports = {
  ...modules
}
