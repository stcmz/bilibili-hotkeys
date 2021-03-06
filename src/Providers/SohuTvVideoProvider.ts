import { Command } from "../Command";
import { Overlay } from "../Overlay";
import { VideoCommands, VideoProvider } from "./VideoProvider";

export class SohuTvVideoProvider extends VideoProvider {
    name: string = "SohuTv";

    get document(): Document {
        return top.document;
    }

    get isReady(): boolean {
        if (this.document.readyState !== "complete")
            return false;

        if (!this.danmuButton)
            return false;

        return true;
    }

    get isPlayer(): boolean {
        return !!this.$("shpdiv.x-player");
    }

    get videoHolder(): HTMLVideoElement | null {
        return this.$("shpdiv.x-player video");
    }

    get overlayHolder(): HTMLDivElement | null {
        return this.$("shpdiv.x-player");
    }

    get playButton(): HTMLButtonElement | null {
        return this.$(".x-play-btn");
    }

    get fullscreenButton(): HTMLButtonElement | null {
        return this.$(".x-fullscreen-btn");
    }

    get speedMenuItem(): HTMLLIElement | null {
        return this.$(".x-playrate-panel button.on");
    }

    private get speedTips(): HTMLDivElement | null {
        return this.$(".x-dash-tip-panel");
    }

    private get danmuButton(): HTMLButtonElement | null {
        return this.$(".x-player .tm-tmbtn");
    }

    commands: VideoCommands = {
        play: this.playCommand(),

        speed: (up: boolean): Command => this.speedCommand(up),

        fullscreen: this.fullscreenCommand(),

        danmu: {
            enabled: true,
            call: (): boolean => {
                let button = this.danmuButton;
                if (!button)
                    return false;
                button.click();
                return true;
            },
            status: (): boolean => {
                let button = this.danmuButton;
                if (!button)
                    return false;
                return button.classList.contains("tm-tmbtn-over");
            },
            message: (): string | null => {
                let button = this.danmuButton;
                if (!button)
                    return null;
                return button.classList.contains("tm-tmbtn-over") ? Overlay.danmuOnText : Overlay.danmuOffText;
            },
        },

        mute: this.muteCommand(),

        volume: (delta: number): Command => this.volumeCommand(delta),

        skip: (delta: number): Command => this.skipCommand(delta),

        seek: (pos: number): Command => this.seekCommand(pos),
    };

    setup(keydownHandler: (event: KeyboardEvent) => void): void {
        // register keydown event handler
        top.document.body.addEventListener("keydown", ev => {
            keydownHandler(ev);
            // relieve official hotkey prevention
            ev.stopPropagation();
        }, true);

        // prevent official keyup seeking
        top.document.body.addEventListener("keyup", ev => ev.stopPropagation(), true);

        // prevent autoplay on seeking
        this.videoHolder?.addEventListener("seeking", ev => ev.stopPropagation(), true);

        // remove default speed tips
        this.speedTips!.style.visibility = "hidden";

        // remove fullscreen clock
        this.$(".x-clock")?.remove();

        // remove official play/pause overlay
        this.$(".x-bezel")?.remove();

        // auto hide danmu
        if (this.commands.danmu.status())
            this.commands.danmu.call();

        // disable muting on button click
        this.$<HTMLButtonElement>(".x-mute-btn")
            ?.addEventListener("click", ev => ev.stopPropagation(), true);
    }
}