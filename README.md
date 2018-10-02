# lxdn

Yet another node-lxd client

API autogenerated from docs

## Usage

Take a look at: https://github.com/lxc/lxd/blob/master/doc/rest-api.md#api-structure

Every API URL is simply mapped to a function.

Example: [`GET /1.0/containers/<name>/console`](https://github.com/lxc/lxd/blob/master/doc/rest-api.md#10containersnameconsole) -> `client.api.containers(name).console.get()`

Every final request function (`.get()`, `.post()`, etc.) allows three arguments:
  - `parameters`: Parameters to post/send. Not allowed on GET (simply set it to `null` if using other args)
  - `query`: Query parameters to add
  - `headers`: Additional headers

Some API calls might return async operations. For those check the `.isAsync` flag if `async` is among the types listed in `operation`. These calls return an `AsyncOperation` object

`AsyncOperation`:
  - `async wait(timeout?)`: Wait, with possible timeout value. Will throw if operation errors.
  - `async cancel()`: Cancel an operation. Throws if not running or uncancelable
  - `async refresh()`: Refresh details about the operation
  - `async websocket()`: For websocket-type operations this returns a websocket connection, for others it throws
  - `verifySuccess()`: Throws if the operation has errored. Prior to calling this `.refresh()` should be called
