"use strict";

module.exports = (t => ({
    events: {
        get: e => (url += "events/get/", t.request("get", url, {
            comment: "`?type=operation,logging`",
            description: "websocket upgrade",
            authentication: [ "trusted" ],
            operation: "(notification about creation, updates and termination of all background operations)",
            return: "none (never ending flow of events)",
            type: "comma separated list of notifications to subscribe to (defaults to all)",
            logging: "(every log entry from the server)",
            lifecycle: "(container lifecycle events)"
        }))
    },
    images: (...e) => {
        url += "images/";
        let r = [ "fingerprint" ];
        if (e.length < 1) throw new Error("Missing parameter " + r.slice(e.length).join(","));
        if (e.length > 1) throw new Error("Too many parameters");
        return url += e.join("/") + "/", {
            get: e => (url += "get/", t.request("get", url, {
                comment: "optional `?secret=SECRET`",
                description: "Image description and metadata",
                authentication: [ "guest", "trusted" ],
                operation: "sync",
                return: "dict representing an image properties"
            })),
            put: e => (url += "put/", t.request("put", url, {
                comment: "ETag supported",
                description: "Replaces the image properties, update information and visibility",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            patch: e => (url += "patch/", t.request("patch", url, {
                comment: "ETag supported",
                description: "Updates the image properties, update information and visibility",
                introduced: "with API extension `patch`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            delete: e => (url += "delete/", t.request("delete", url, {
                description: "Remove an image",
                authentication: [ "trusted" ],
                operation: "async",
                return: "background operaton or standard error"
            })),
            secret: {
                post: e => (url += "secret/post/", t.request("post", url, {
                    description: "Generate a random token and tell LXD to expect it be used by a guest",
                    authentication: [ "guest", "trusted" ],
                    operation: "async",
                    return: "background operation or standard error"
                }))
            },
            export: {
                get: e => (url += "export/get/", t.request("get", url, {
                    comment: "optional `?secret=SECRET`",
                    description: "Download the image tarball",
                    authentication: [ "guest", "trusted" ],
                    operation: "sync",
                    return: "Raw file or standard error"
                }))
            },
            refresh: {
                post: e => (url += "refresh/post/", t.request("post", url, {
                    description: "Refresh an image from its origin",
                    authentication: [ "trusted" ],
                    operation: "async",
                    return: "Background operation or standard error"
                }))
            }
        };
    },
    cluster: {
        get: e => (url += "cluster/get/", t.request("get", url, {
            description: "information about a cluster (such as networks and storage pools)",
            introduced: "with API extension `clustering`",
            authentication: [ "trusted", "untrusted" ],
            operation: "sync",
            return: "dict representing a cluster"
        })),
        put: e => (url += "cluster/put/", t.request("put", url, {
            description: "bootstrap or join a cluster, or disable clustering on this node",
            introduced: "with API extension `clustering`",
            authentication: [ "trusted" ],
            operation: "sync or async",
            return: "various payloads depending on the input"
        })),
        members: {
            get: e => (url += "cluster/members/get/", t.request("get", url, {
                description: "list of LXD members in the cluster",
                introduced: "with API extension `clustering`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "list of cluster members"
            }))
        }
    },
    profiles: (...e) => {
        url += "profiles/";
        let r = [ "name" ];
        if (e.length < 1) throw new Error("Missing parameter " + r.slice(e.length).join(","));
        if (e.length > 1) throw new Error("Too many parameters");
        return url += e.join("/") + "/", {
            get: e => (url += "get/", t.request("get", url, {
                description: "profile configuration",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "dict representing the profile content"
            })),
            put: e => (url += "put/", t.request("put", url, {
                comment: "ETag supported",
                description: "replace the profile information",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            patch: e => (url += "patch/", t.request("patch", url, {
                comment: "ETag supported",
                description: "update the profile information",
                introduced: "with API extension `patch`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            post: e => (url += "post/", t.request("post", url, {
                description: "rename a profile",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            delete: e => (url += "delete/", t.request("delete", url, {
                description: "remove a profile",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            }))
        };
    },
    networks: (...e) => {
        url += "networks/";
        let r = [ "name" ];
        if (e.length < 1) throw new Error("Missing parameter " + r.slice(e.length).join(","));
        if (e.length > 1) throw new Error("Too many parameters");
        return url += e.join("/") + "/", {
            get: e => (url += "get/", t.request("get", url, {
                description: "information about a network",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "dict representing a network"
            })),
            put: e => (url += "put/", t.request("put", url, {
                comment: "ETag supported",
                description: "replace the network information",
                introduced: "with API extension `network`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            patch: e => (url += "patch/", t.request("patch", url, {
                comment: "ETag supported",
                description: "update the network information",
                introduced: "with API extension `network`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            post: e => (url += "post/", t.request("post", url, {
                description: "rename a network",
                introduced: "with API extension `network`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            delete: e => (url += "delete/", t.request("delete", url, {
                description: "remove a network",
                introduced: "with API extension `network`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            state: {
                get: e => (url += "state/get/", t.request("get", url, {
                    description: "network state",
                    authentication: [ "trusted" ],
                    operation: "sync",
                    return: "dict representing a network's state"
                }))
            }
        };
    },
    resources: {
        get: e => (url += "resources/get/", t.request("get", url, {
            description: "information about the resources available to the LXD server",
            introduced: "with API extension `resources`",
            authentication: [ "guest, untrusted", "trusted" ],
            operation: "sync",
            return: "dict representing the system resources"
        }))
    },
    containers: (...e) => {
        url += "containers/";
        let r = [ "name" ];
        if (e.length < 1) throw new Error("Missing parameter " + r.slice(e.length).join(","));
        if (e.length > 1) throw new Error("Too many parameters");
        return url += e.join("/") + "/", {
            get: e => (url += "get/", t.request("get", url, {
                description: "Container information",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "dict of the container configuration and current state."
            })),
            put: e => (url += "put/", t.request("put", url, {
                comment: "ETag supported",
                description: "replaces container configuration or restore snapshot",
                authentication: [ "trusted" ],
                operation: "async",
                return: "background operation or standard error"
            })),
            patch: e => (url += "patch/", t.request("patch", url, {
                comment: "ETag supported",
                description: "update container configuration",
                introduced: "with API extension `patch`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            post: e => (url += "post/", t.request("post", url, {
                comment: "optional `?target=<member>`",
                description: "used to rename/migrate the container",
                authentication: [ "trusted" ],
                operation: "async",
                return: "background operation or standard error"
            })),
            delete: e => (url += "delete/", t.request("delete", url, {
                description: "remove the container",
                authentication: [ "trusted" ],
                operation: "async",
                return: "background operation or standard error"
            })),
            exec: {
                post: e => (url += "exec/post/", t.request("post", url, {
                    description: "run a remote command",
                    authentication: [ "trusted" ],
                    operation: "async",
                    return: "background operation + optional websocket information or standard error"
                }))
            },
            logs: {
                get: e => (url += "logs/get/", t.request("get", url, {
                    description: "Returns a list of the log files available for this container.",
                    authentication: [ "trusted" ],
                    operation: "Sync",
                    return: "a list of the available log files"
                }))
            },
            state: {
                get: e => (url += "state/get/", t.request("get", url, {
                    description: "current state",
                    authentication: [ "trusted" ],
                    operation: "sync",
                    return: "dict representing current state"
                })),
                put: e => (url += "state/put/", t.request("put", url, {
                    description: "change the container state",
                    authentication: [ "trusted" ],
                    operation: "async",
                    return: "background operation or standard error"
                }))
            },
            files: {
                get: e => (url += "files/get/", t.request("get", url, {
                    comment: "`?path=/path/inside/the/container`",
                    description: "download a file or directory listing from the container",
                    authentication: [ "trusted" ],
                    operation: "sync",
                    return: "if the type of the file is a directory, the return is a sync",
                    "`x-lxd-uid`": "0",
                    "`x-lxd-gid`": "0",
                    "`x-lxd-mode`": "0700",
                    "`x-lxd-type`": "one of `directory` or `file`"
                })),
                post: e => (url += "files/post/", t.request("post", url, {
                    comment: "`?path=/path/inside/the/container`",
                    description: "upload a file to the container",
                    authentication: [ "trusted" ],
                    operation: "sync",
                    return: "standard return value or standard error",
                    standard: "http file upload",
                    "`x-lxd-uid`": "0",
                    "`x-lxd-gid`": "0",
                    "`x-lxd-mode`": "0700",
                    "`x-lxd-type`": "one of `directory`, `file` or `symlink`",
                    "`x-lxd-write`": "overwrite (or append, introduced with API extension `file_append`)"
                })),
                delete: e => (url += "files/delete/", t.request("delete", url, {
                    comment: "`?path=/path/inside/the/container`",
                    description: "delete a file in the container",
                    introduced: "with API extension `file_delete`",
                    authentication: [ "trusted" ],
                    operation: "sync",
                    return: "standard return value or standard error"
                }))
            },
            console: {
                get: e => (url += "console/get/", t.request("get", url, {
                    description: "returns the contents of the container's console  log",
                    authentication: [ "trusted" ],
                    return: "the contents of the console log"
                })),
                post: e => (url += "console/post/", t.request("post", url, {
                    description: "attach to a container's console devices",
                    authentication: [ "trusted" ],
                    operation: "async",
                    return: "standard error"
                })),
                delete: e => (url += "console/delete/", t.request("delete", url, {
                    description: "empty the container's console log",
                    authentication: [ "trusted" ],
                    operation: "Sync",
                    return: "empty response or standard error"
                }))
            },
            backups: {
                get: e => (url += "backups/get/", t.request("get", url, {
                    description: "List of backups for the container",
                    introduced: "with API extension `container_backup`",
                    authentication: [ "trusted" ],
                    operation: "sync",
                    return: "a list of backups for the container"
                })),
                post: e => (url += "backups/post/", t.request("post", url, {
                    description: "Create a new backup",
                    introduced: "with API extension `container_backup`",
                    authentication: [ "trusted" ],
                    operation: "async",
                    returns: "background operation or standard error"
                }))
            },
            metadata: {
                get: e => (url += "metadata/get/", t.request("get", url, {
                    description: "Container metadata",
                    introduced: "with API extension `container_edit_metadata`",
                    authentication: [ "trusted" ],
                    operation: "Sync",
                    return: "dict representing container metadata"
                })),
                put: e => (url += "metadata/put/", t.request("put", url, {
                    comment: "ETag supported",
                    description: "Replaces container metadata",
                    introduced: "with API extension `container_edit_metadata`",
                    authentication: [ "trusted" ],
                    operation: "sync",
                    return: "standard return value or standard error"
                })),
                templates: {
                    get: e => (url += "metadata/templates/get/", t.request("get", url, {
                        comment: "`?path=<template>`",
                        description: "Content of a container template",
                        introduced: "with API extension `container_edit_metadata`",
                        authentication: [ "trusted" ],
                        operation: "Sync",
                        return: "the content of the template"
                    })),
                    post: e => (url += "metadata/templates/post/", t.request("post", url, {
                        comment: "`?path=<template>`",
                        description: "Add a continer template",
                        introduced: "with API extension `container_edit_metadata`",
                        authentication: [ "trusted" ],
                        operation: "Sync",
                        return: "standard return value or standard error",
                        standard: "http file upload."
                    })),
                    put: e => (url += "metadata/templates/put/", t.request("put", url, {
                        comment: "`?path=<template>`",
                        description: "Replace content of a template",
                        introduced: "with API extension `container_edit_metadata`",
                        authentication: [ "trusted" ],
                        operation: "Sync",
                        return: "standard return value or standard error",
                        standard: "http file upload."
                    })),
                    delete: e => (url += "metadata/templates/delete/", t.request("delete", url, {
                        comment: "`?path=<template>`",
                        description: "Delete a container template",
                        introduced: "with API extension `container_edit_metadata`",
                        authentication: [ "trusted" ],
                        operation: "Sync",
                        return: "standard return value or standard error"
                    }))
                }
            },
            snapshots: {
                get: e => (url += "snapshots/get/", t.request("get", url, {
                    description: "List of snapshots",
                    authentication: [ "trusted" ],
                    operation: "sync",
                    return: "list of URLs for snapshots for this container"
                })),
                post: e => (url += "snapshots/post/", t.request("post", url, {
                    description: "create a new snapshot",
                    authentication: [ "trusted" ],
                    operation: "async",
                    return: "background operation or standard error"
                }))
            }
        };
    },
    operations: (...e) => {
        url += "operations/";
        let r = [ "uuid" ];
        if (e.length < 1) throw new Error("Missing parameter " + r.slice(e.length).join(","));
        if (e.length > 1) throw new Error("Too many parameters");
        return url += e.join("/") + "/", {
            get: e => (url += "get/", t.request("get", url, {
                description: "background operation",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "dict representing a background operation"
            })),
            delete: e => (url += "delete/", t.request("delete", url, {
                description: 'cancel an operation. Calling this will change the state to "cancelling" rather than actually removing the entry.',
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            wait: {
                get: e => (url += "wait/get/", t.request("get", url, {
                    comment: "optional `?timeout=30`",
                    description: "Wait for an operation to finish",
                    authentication: [ "trusted" ],
                    operation: "sync",
                    return: "dict of the operation after it's reached its final state"
                }))
            },
            websocket: {
                get: e => (url += "websocket/get/", t.request("get", url, {
                    comment: "`?secret=SECRET`",
                    description: "This connection is upgraded into a websocket connection",
                    authentication: [ "guest", "trusted" ],
                    operation: "sync",
                    return: "websocket stream or standard error"
                }))
            }
        };
    },
    certificates: (...e) => {
        url += "certificates/";
        let r = [ "fingerprint" ];
        if (e.length < 1) throw new Error("Missing parameter " + r.slice(e.length).join(","));
        if (e.length > 1) throw new Error("Too many parameters");
        return url += e.join("/") + "/", {
            get: e => (url += "get/", t.request("get", url, {
                description: "trusted certificate information",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "dict representing a trusted certificate"
            })),
            put: e => (url += "put/", t.request("put", url, {
                comment: "ETag supported",
                description: "Replaces the certificate properties",
                introduced: "with API extension `certificate_update`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            patch: e => (url += "patch/", t.request("patch", url, {
                comment: "ETag supported",
                description: "Updates the certificate properties",
                introduced: "with API extension `certificate_update`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            delete: e => (url += "delete/", t.request("delete", url, {
                description: "Remove a trusted certificate",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            }))
        };
    },
    "storage-pools": (...e) => {
        url += "storage-pools/";
        let r = [ "name" ];
        if (e.length < 1) throw new Error("Missing parameter " + r.slice(e.length).join(","));
        if (e.length > 1) throw new Error("Too many parameters");
        return url += e.join("/") + "/", {
            get: e => (url += "get/", t.request("get", url, {
                description: "information about a storage pool",
                introduced: "with API extension `storage`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "dict representing a storage pool"
            })),
            put: e => (url += "put/", t.request("put", url, {
                comment: "ETag supported",
                description: "replace the storage pool information",
                introduced: "with API extension `storage`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            patch: e => (url += "patch/", t.request("patch", url, {
                description: "update the storage pool configuration",
                introduced: "with API extension `storage`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            delete: e => (url += "delete/", t.request("delete", url, {
                description: "delete a storage pool",
                introduced: "with API extension `storage`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            volumes: {
                get: e => (url += "volumes/get/", t.request("get", url, {
                    description: "list of storage volumes",
                    introduced: "with API extension `storage`",
                    authentication: [ "trusted" ],
                    operation: "sync",
                    return: "list of storage volumes that currently exist on a given storage pool"
                })),
                post: e => (url += "volumes/post/", t.request("post", url, {
                    description: "create a new storage volume on a given storage pool",
                    introduced: "with API extension `storage`",
                    authentication: [ "trusted" ],
                    operation: "sync or async (when copying an existing volume)",
                    return: "standard return value or standard error"
                }))
            },
            resources: {
                get: e => (url += "resources/get/", t.request("get", url, {
                    description: "information about the resources available to the storage pool",
                    introduced: "with API extension `resources`",
                    authentication: [ "trusted" ],
                    operation: "sync",
                    return: "dict representing the storage pool resources"
                }))
            }
        };
    },
    backups: (...e) => {
        url += "backups/";
        let r = [ "name" ];
        if (e.length < 1) throw new Error("Missing parameter " + r.slice(e.length).join(","));
        if (e.length > 1) throw new Error("Too many parameters");
        return url += e.join("/") + "/", {
            get: e => (url += "get/", t.request("get", url, {
                description: "Backup information",
                introduced: "with API extension `container_backup`",
                authentication: [ "trusted" ],
                operation: "sync",
                returns: "dict of the backup"
            })),
            delete: e => (url += "delete/", t.request("delete", url, {
                description: "remove the backup",
                introduced: "with API extension `container_backup`",
                authentication: [ "trusted" ],
                operation: "async",
                return: "background operation or standard error"
            })),
            post: e => (url += "post/", t.request("post", url, {
                description: "used to rename the backup",
                introduced: "with API extension `container_backup`",
                authentication: [ "trusted" ],
                operation: "async",
                return: "background operation or standard error"
            })),
            export: {
                get: e => (url += "export/get/", t.request("get", url, {
                    description: "fetch the backup tarball",
                    introduced: "with API extension `container_backup`",
                    authentication: [ "trusted" ],
                    operation: "sync",
                    return: "dict containing the backup tarball"
                }))
            }
        };
    },
    logs: (...e) => {
        url += "logs/";
        let r = [ "logfile" ];
        if (e.length < 1) throw new Error("Missing parameter " + r.slice(e.length).join(","));
        if (e.length > 1) throw new Error("Too many parameters");
        return url += e.join("/") + "/", {
            get: e => (url += "get/", t.request("get", url, {
                description: "returns the contents of a particular log file.",
                authentication: [ "trusted" ],
                return: "the contents of the log file"
            })),
            delete: e => (url += "delete/", t.request("delete", url, {
                description: "delete a particular log file.",
                authentication: [ "trusted" ],
                operation: "Sync",
                return: "empty response or standard error"
            }))
        };
    },
    snapshots: (...e) => {
        url += "snapshots/";
        let r = [ "name" ];
        if (e.length < 1) throw new Error("Missing parameter " + r.slice(e.length).join(","));
        if (e.length > 1) throw new Error("Too many parameters");
        return url += e.join("/") + "/", {
            get: e => (url += "get/", t.request("get", url, {
                description: "Snapshot information",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "dict representing the snapshot"
            })),
            post: e => (url += "post/", t.request("post", url, {
                description: "used to rename/migrate the snapshot",
                authentication: [ "trusted" ],
                operation: "async",
                return: "background operation or standard error"
            })),
            delete: e => (url += "delete/", t.request("delete", url, {
                description: "remove the snapshot",
                authentication: [ "trusted" ],
                operation: "async",
                return: "background operation or standard error"
            }))
        };
    },
    volumes: (...e) => {
        url += "volumes/";
        let r = [ "type" ];
        if (e.length < 1) throw new Error("Missing parameter " + r.slice(e.length).join(","));
        if (e.length > 1) throw new Error("Too many parameters");
        return url += e.join("/") + "/", {
            post: e => (url += "post/", t.request("post", url, {
                description: "rename a storage volume on a given storage pool",
                introduced: "with API extension `storage_api_volume_rename`",
                authentication: [ "trusted" ],
                operation: "sync or async (when moving to a different pool)",
                return: "standard return value or standard error"
            })),
            get: e => (url += "get/", t.request("get", url, {
                description: "information about a storage volume of a given type on a storage pool",
                introduced: "with API extension `storage`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "dict representing a storage volume"
            })),
            put: e => (url += "put/", t.request("put", url, {
                comment: "ETag supported",
                description: "replace the storage volume information or restore from snapshot",
                introduced: "with API extension `storage`, `storage_api_volume_snapshots`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            patch: e => (url += "patch/", t.request("patch", url, {
                comment: "ETag supported",
                description: "update the storage volume information",
                introduced: "with API extension `storage`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            delete: e => (url += "delete/", t.request("delete", url, {
                description: "delete a storage volume of a given type on a given storage pool",
                introduced: "with API extension `storage`",
                authentication: [ "trusted" ],
                operation: "sync",
                return: "standard return value or standard error"
            })),
            snapshots: {
                get: e => (url += "snapshots/get/", t.request("get", url, {
                    description: "List of volume snapshots",
                    authentication: [ "trusted" ],
                    operation: "sync",
                    return: "list of URLs for snapshots for this volume"
                })),
                post: e => (url += "snapshots/post/", t.request("post", url, {
                    description: "create a new volume snapshot",
                    authentication: [ "trusted" ],
                    operation: "async",
                    return: "background operation or standard error"
                })),
                name: {
                    get: e => (url += "snapshots/name/get/", t.request("get", url, {
                        description: "Snapshot information",
                        authentication: [ "trusted" ],
                        operation: "sync",
                        return: "dict representing the snapshot"
                    })),
                    put: e => (url += "snapshots/name/put/", t.request("put", url, {
                        description: "Volume snapshot information",
                        authentication: [ "trusted" ],
                        operation: "sync",
                        return: "dict representing the volume snapshot"
                    })),
                    post: e => (url += "snapshots/name/post/", t.request("post", url, {
                        description: "used to rename the volume snapshot",
                        authentication: [ "trusted" ],
                        operation: "async",
                        return: "background operation or standard error"
                    })),
                    delete: e => (url += "snapshots/name/delete/", t.request("delete", url, {
                        description: "remove the volume snapshot",
                        authentication: [ "trusted" ],
                        operation: "async",
                        return: "background operation or standard error"
                    }))
                }
            }
        };
    }
}));