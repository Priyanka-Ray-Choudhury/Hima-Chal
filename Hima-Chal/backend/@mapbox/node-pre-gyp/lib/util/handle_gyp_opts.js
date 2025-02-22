'use strict';

module.exports = exports = handle_gyp_opts;

const versioning = require('./versioning.js');
const napi = require('./napi.js');

/*

Here we gather node-pre-gyp generated options (from versioning) and pass them along to node-gyp.

We massage the args and options slightly to account for differences in what commands mean between
node-pre-gyp and node-gyp (e.g. see the difference between "build" and "rebuild" below)

Keep in mind: the values inside `argv` and `gyp.opts` below are different depending on whether
node-pre-gyp is called directory, or if it is called in a `run-script` phase of npm.

We also try to preserve any command line options that might have been passed to npm or node-pre-gyp.
But this is fairly difficult without passing way to much through. For example `gyp.opts` contains all
the process.env and npm pushes a lot of variables into process.env which node-pre-gyp inherits. So we have
to be very selective about what we pass through.

For example:

`npm install --build-from-source` will give:

argv == [ 'rebuild' ]
gyp.opts.argv == { remain: [ 'install' ],
  cooked: [ 'install', '--fallback-to-build' ],
  original: [ 'install', '--fallback-to-build' ] }

`./bin/node-pre-gyp build` will give:

argv == []
gyp.opts.argv == { remain: [ 'build' ],
  cooked: [ 'build' ],
  original: [ '-C', 'test/app1', 'build' ] }

*/

// select set of node-pre-gyp versioning info
// to share with node-gyp
const share_with_node_gyp = [
  'module',
  'module_name',
  'module_path',
  'napi_version',
  'node_abi_napi',
  'napi_build_version',
  'node_napi_label'
];

function handle_gyp_opts(gyp, argv, callback) {

  // Collect node-pre-gyp specific variables to pass to node-gyp
  const node_pre_gyp_options = [];
  // generate custom node-pre-gyp versioning info
  const napi_build_version = napi.get_napi_build_version_from_command_args(argv);
  const opts = versioning.evaluate(gyp.package_json, gyp.opts, napi_build_version);
  share_with_node_gyp.forEach((key) => {
    const val = opts[key];
    if (val) {
      node_pre_gyp_options.push('--' + key + '=' + val);
    } else if (key === 'napi_build_version') {
      node_pre_gyp_options.push('--' + key + '=0');
    } else {
      if (key !== 'napi_version' && key !== 'node_abi_napi')
        return callback(new Error('Option ' + key + ' required but not found by node-pre-gyp'));
    }
  });

  // Collect options that follow the special -- which disables nopt parsing
  const unparsed_options = [];
  let double_hyphen_found = false;
  gyp.opts.argv.original.forEach((opt) => {
    if (double_hyphen_found) {
      unparsed_options.push(opt);
    }
    if (opt === '--') {
      double_hyphen_found = true;
    }
  });

  // We try respect and pass through remaining command
  // line options (like --foo=bar) to node-gyp
  const cooked = gyp.opts.argv.cooked;
  const node_gyp_options = [];
  cooked.forEach((value) => {
    if (value.length > 2 && value.slice(0, 2) === '--') {
      const key = value.slice(2);
      const val = cooked[cooked.indexOf(value) + 1];
      if (val && val.indexOf('--') === -1) { // handle '--foo=bar' or ['--foo','bar']
        node_gyp_options.push('--' + key + '=' + val);
      } else { // pass through --foo
        node_gyp_options.push(value);
      }
    }
  });

  const result = { 'opts': opts, 'gyp': node_gyp_options, 'pre': node_pre_gyp_options, 'unparsed': unparsed_options };
  return callback(null, result);
}