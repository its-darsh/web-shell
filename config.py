import os
import time
import json
import cairo
import psutil
from fabric import Application
from fabric.audio import Audio, AudioStream
from fabric.hyprland import Hyprland
from fabric.notifications import Notifications
from fabric.widgets.webview import WebView
from fabric.widgets.wayland import WaylandWindow
from fabric.utils import bulk_connect, idle_add, monitor_file, get_relative_path, logger
from collections.abc import Callable
from gi.repository import Gdk, Playerctl


# supress webview logs
logger.disable("fabric.widgets.webview.webview")


# wiki: https://wiki.ffpy.org/api/widgets/webview
class WebShell(WebView):
    def __init__(self, **kwargs):
        super().__init__(url="http://localhost:5173", open_bride=True, **kwargs)
        if not self.bridge:
            return

        self.set_background_color(Gdk.RGBA(0, 0, 0, 0))

        self._hyprland = Hyprland()
        self._player = Playerctl.Player(player_name="spotify")

        def on_volume_changed(speaker: AudioStream, *_):
            return self.fire_event("audioVolumeChanged", volume=speaker.volume)

        self._audio = Audio(
            notify_speaker=lambda a, *_: None
            if not (spk := a.speaker)
            else (
                spk.connect("notify::volume", on_volume_changed),
                on_volume_changed(spk),
            ),
        )
        self._notifications = Notifications(
            on_notification_added=lambda _, nid: None
            if not (notif := self._notifications.get_notification_from_id(nid))
            else self.fire_event("notificationAdded", notification=notif.serialize())  # type: ignore
        )

        bulk_connect(
            self._hyprland,
            {
                "event::workspacev2": lambda _, event: None
                if len(event.data) != 2
                else self.fire_event(
                    "hyprlandActiveWorkspace", workspaceId=int(event.data[0])
                ),
                "event::createworkspacev2": lambda _, event: None
                if len(event.data) != 2
                else self.fire_event(
                    "hyprlandCreateWorkspace", workspaceId=int(event.data[0])
                ),
                "event::destroyworkspacev2": lambda _, event: None
                if len(event.data) != 2
                else self.fire_event(
                    "hyprlandDestroyWorkspace", workspaceId=int(event.data[0])
                ),
                "event::activelayout": lambda _, event: None
                if len(event.data) < 2
                else self.fire_event(
                    "hyprlandActiveLayout",
                    keyboard=event.data[0],
                    language=event.data[1],
                ),
            },
        )

        bulk_connect(
            self._player,
            {
                "metadata": lambda *_: self.fire_event("playerMetadataChanged"),
                "playback-status": lambda _, ps: self.fire_event(
                    "playerPlay" if ps == 0 else "playerPause"
                ),
                "loop-status": lambda _, ls: self.fire_event(
                    "playerLoopChanged",
                    loopStatus="none"
                    if ls == 0
                    else "track"
                    if ls == 1
                    else "playlist",
                ),
            },
        )

        self._colorscheme_monitor = monitor_file(
            os.path.expanduser("~/.cache/wal/colors.json")
        )
        self._colorscheme_monitor.connect(
            "changed", lambda *_: self.fire_event("colorschemeChanged")
        )

        self.bulk_expose_function(
            {
                "audioSetVolume": lambda volume, *_: None
                if not (spk := self._audio.speaker)
                else spk.set_volume(volume),
                "audioGetVolume": lambda *_: None
                if not (spk := self._audio.speaker)
                else spk.volume,
                "hyprlandSendCommand": lambda cmd: json.loads(r.reply)
                if not (r := self._hyprland.send_command(cmd)).is_ok
                else r.reply,
                "playerGetTitle": self._player.get_title,
                "playerGetArtist": self._player.get_artist,
                "playerGetAlbum": self._player.get_album,
                "playerGetPosition": self._player.get_position,
                "playerNext": self._player.next,
                "playerPrevious": self._player.previous,
                "playerPlay": self._player.play,
                "playerPause": self._player.pause,
                "playerPlayPause": self._player.play_pause,
                "playerGetStatus": lambda: int(self._player.props.playback_status),
                "playerGetMetadata": lambda: dict(self._player.props.metadata),
                "formatTimeString": lambda formatter: time.strftime(formatter),
                "fetchSystemStats": lambda *_: {
                    "cpu": psutil.cpu_percent(),
                    "ram": psutil.virtual_memory().percent,
                },
                "setInputRegions": lambda *a: idle_add(self.do_set_input_regions, *a),
                "notificationsInvokeAction": self._notifications.invoke_notification_action,
                "notificationsClose": self._notifications.close_notification,
                "getColorscheme": lambda: json.loads(
                    open(os.path.expanduser("~/.cache/wal/colors.json"), "r").read()
                )["colors"],
            }
        )
        # self.open_inspector()

    def bulk_expose_function(self, functions: dict[str, Callable] = {}):
        for name, func in functions.items():
            self.bridge.expose_function(func, name)

    def fire_event(self, name: str, **kwargs):
        return self.run_javascript(
            f"""
                var event = new Event({json.dumps(name)});
                {'\n'.join([f'event[{json.dumps(k)}] = {json.dumps(v)};' for k, v in kwargs.items()])}
                window.dispatchEvent(event);
            """
        )

    def do_set_input_regions(
        self, input_regions: list[dict[str, int]], visualize: bool = False
    ):
        self.get_parent().input_shape_combine_region(
            cairo.Region(
                [
                    cairo.RectangleInt(
                        int(r["x"]), int(r["y"]), int(r["width"]), int(r["height"])
                    )
                    for r in input_regions
                ]
            )
        )
        if not visualize:
            return

        alloc = self.get_allocation()
        dummy_surface = cairo.ImageSurface(
            cairo.Format.ARGB32, alloc.width, alloc.height
        )
        dummy_cr = cairo.Context(dummy_surface)

        dummy_cr.save()

        # reset already painted mask...
        dummy_cr.set_source_rgba(0.0, 0.0, 0.0, 0.0)
        dummy_cr.set_operator(cairo.Operator.SOURCE)
        dummy_cr.paint()
        dummy_cr.set_source_rgb(1, 1, 1)
        [
            dummy_cr.rectangle(
                int(r["x"]), int(r["y"]), int(r["width"]), int(r["height"])
            )
            for r in input_regions
        ]
        dummy_cr.fill()
        dummy_cr.restore()

        dummy_surface.write_to_png(
            f"{get_relative_path('.')}/webview-input-regions.png"
        )
        return


Application(
    "web-shell",
    WaylandWindow(
        layer="top",
        anchor="left top right bottom",
        child=WebShell(),
        all_visible=True,
        pass_through=True,
        exclusivity="none",
        keyboard_mode="on-demand",
        style="background-color: transparent;",
    ),
).run()
