function exec(args) {
    var a = parseInt(args.a) || 0,
        b = parseInt(args.b) || 0;

    return {
        rs : a + b
    };
}