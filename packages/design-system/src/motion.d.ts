export declare const motionPresets: {
    readonly fade: {
        readonly initial: {
            readonly opacity: 0;
        };
        readonly animate: {
            readonly opacity: 1;
        };
        readonly exit: {
            readonly opacity: 0;
        };
    };
    readonly slideUp: {
        readonly initial: {
            readonly opacity: 0;
            readonly transform: "translateY(12px)";
        };
        readonly animate: {
            readonly opacity: 1;
            readonly transform: "translateY(0px)";
        };
        readonly exit: {
            readonly opacity: 0;
            readonly transform: "translateY(12px)";
        };
    };
    readonly scale: {
        readonly initial: {
            readonly opacity: 0;
            readonly transform: "scale(0.98)";
        };
        readonly animate: {
            readonly opacity: 1;
            readonly transform: "scale(1)";
        };
        readonly exit: {
            readonly opacity: 0;
            readonly transform: "scale(0.98)";
        };
    };
};
