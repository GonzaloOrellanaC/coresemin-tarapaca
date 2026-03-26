#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ignore = require('ignore');
const fg = require('fast-glob');
const archiver = require('archiver');

(async () => {
  try {
    const root = process.cwd();
    const gitignorePath = path.join(root, '.gitignore');
    let ig = ignore();
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf8');
      ig = ig.add(content);
    }

    const entries = await fg(['**/*'], { dot: true, onlyFiles: true });
    const files = entries.filter(p => !ig.ignores(p));

    if (files.length === 0) {
      console.log('No hay archivos para incluir en el ZIP.');
      process.exit(0);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outName = `archive-${timestamp}.zip`;
    const output = fs.createWriteStream(outName);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`${outName} creado (${archive.pointer()} bytes)`);
    });

    archive.on('warning', err => {
      if (err.code === 'ENOENT') console.warn(err);
      else throw err;
    });

    archive.on('error', err => { throw err; });

    archive.pipe(output);

    for (const file of files) {
      archive.file(path.join(root, file), { name: file });
    }

    await archive.finalize();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
