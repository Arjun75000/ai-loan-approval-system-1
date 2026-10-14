const { execFile } = require("child_process");
const path = require("path");
const config = require("../config/environment");

const runPythonScript = (scriptName, inputData) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(config.mlDir, scriptName);
    const pythonPath = config.pythonPath;

    const child = execFile(
      pythonPath,
      [scriptPath],
      {
        timeout: config.predictionTimeout,
        maxBuffer: 1024 * 1024 * 5,
        cwd: config.mlDir
      },
      (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            reject(new Error("Python process timed out"));
          } else {
            reject(new Error(`Python process failed: ${error.message}`));
          }
          return;
        }

        try {
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Failed to parse Python output: ${stdout.substring(0, 200)}`));
        }
      }
    );

    if (inputData) {
      child.stdin.write(JSON.stringify(inputData));
      child.stdin.end();
    }
  });
};

module.exports = { runPythonScript };
