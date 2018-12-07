function cameraName(label)
{
    var clean = label.replace(/\s*\([0-9a-f]+(:[0-9a-f]+)?\)\s*$/, '');
    return clean || label || null;
}

class Camera {
    constructor(id, name)
    {
        this.id = id;
        this.name = name;
        this._stream = null;
        this.devices = [];
    }

    async start()
    {
        let constraints;
        var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        if (iOS === true)
        {
            constraints = {
                video: {facingMode: 'environment'},
                audio: false
            };
        }
        else
        {
            constraints = {
                audio: false,
                video: {
                    mandatory: {
                        sourceId: this.id,
                        minAspectRatio: 1.6
                    },
                    optional: []
                }
            };
        }

        this._stream = await navigator.mediaDevices.getUserMedia(constraints);

        const video = document.querySelector('video');
        const videoTracks = this._stream.getVideoTracks();

        // make variable available to browser console
        window.stream = this._stream;
        return video.srcObject = this._stream;

        // return window.URL.createObjectURL(this._stream);
    }

    stop()
    {
        if (!this._stream)
        {
            return;
        }

        for (let stream of this._stream.getVideoTracks())
        {
            stream.stop();
        }

        this._stream = null;
    }

    static async getCameras()
    {
        let constraints = {
            video: true,
            audio: false
        };

        //opening and closing the stream to get devices names
        let stream = await navigator.mediaDevices.getUserMedia(constraints);
        let devices = await navigator.mediaDevices.enumerateDevices();

        stream.getTracks().forEach(track => {
            track.stop();
        });

        return devices
            .filter(d => d.kind === 'videoinput')
            .map(d => new Camera(d.deviceId, cameraName(d.label)));
    }

}

module.exports = Camera;
