import Shell from "../shell.js"

// https://vitejs.dev/guide/assets.html#importing-asset-as-string
import banner from "./banner.txt?raw"

//import {javascript} from "@codemirror/lang-javascript"
//import {StreamLanguage} from "@codemirror/language"
//import {lua} from "@codemirror/legacy-modes/mode/lua"
//import {shell} from "@codemirror/legacy-modes/mode/shell"
//import {javascript} from "@codemirror/legacy-modes/mode/javascript"

import * as esprima from "esprima"

/**
 * this is our interpreter.  note that writing responses to the shell
 * is decoupled from commands -- the result of this function (via callback)
 * only affects display of the prompt.
 */
function exec_function(cmd, callback) {
  var ps = shell.PARSE_STATUS.OK
  if (cmd.length) {
    var composed = cmd.join("\n")
    console.log("composed", composed)
    const parse = esprima.parse
    try {
      parse(composed)
    } catch (err) {
      console.log("err", err)
      if (err.description.match(/Unexpected end of input/)) {
        ps = shell.PARSE_STATUS.INCOMPLETE
      }
    }
    if (ps == shell.PARSE_STATUS.OK) {
      /*
      // TODO move the "shell.response" code into "composed"
      // wrap async code
      composed = [
        '(async () => { ', composed, '; })()',
        '.then((result) => TODO)',
        '.catch((error) => TODO);'
      ].join('');
      */
      try {
        // eval javascript
        // TODO mock/patch console.log, so we see output in gui
        console.log("eval:\n" + composed)
        var text,
          result = window.eval(composed)
        console.log("eval", { text, result })
        try {
          text = JSON.stringify(result)
        } catch (e) {
          text = result.toString()
        }
        // unix convention: newline after every line
        text += "\n"
        // send result to shell
        shell.response(text)
      } catch (e) {
        shell.response(e.name + ": " + e.message + "\n", "shell-error")
      }
    }
  }
  callback.call(this, { parsestatus: ps })
}

/** one overloaded global method */
window.print = function (a) {
  shell.response(JSON.stringify(a))
}

/**
 * this is the shell constructor
 */
var shell = new Shell({
  container: "#shell-container",
  //container: document.body,
  // TODO syntax highlighting
  //mode: 'javascript',
  //mode: javascript,
  exec_function,
})

/**
 * set up style and focus
 */
//shell.setOption( "theme", "zenburn" );
shell.focus();

shell.response(banner, "banner")
