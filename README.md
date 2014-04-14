corkable
========

Disables the default uncork-on-end behavior of streams3.  This allows you to create streams that wait for something to happen (like a connection opening) before they emit any data, even if their source stream emits end before that happens.
