const parse = require("../src/index.js");

console.log(
    parse.parse(`
        <html>
            <body id="body" name="body">
                <p class="p">
                    Hello, World!
                </p>
                <small name="xxcool">
                    This is small
                </small>
                <label id="testid" name="xxcool">
                    My Text
                </label>
            </body>
        </html>
    `).querySelector("#body small[name='xxcool']")
);