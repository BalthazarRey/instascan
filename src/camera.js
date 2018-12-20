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
        var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        let constraints = {
            video: true,
            audio: false
        };


        if (iOS === true)
        {
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            let devices = await navigator.mediaDevices.enumerateDevices();

            let get_video_devices = devices.filter(d => d.kind === 'videoinput');

            this.stream.getTracks().forEach(track => {
                track.stop();
            });

            for (let i = 0; i < get_video_devices.length; i++)
            {
                if (get_video_devices[i].deviceId == this.id)
                {
                    if (get_video_devices[i].label.toLowerCase().indexOf('back') != -1 )
                    {
                        constraints  = {
                            video: {
                                facingMode: 'environment'
                            },
                            audio: false
                        };
                        break;
                    }

                    if (get_video_devices[i].label.toLowerCase().indexOf('front') != -1 )
                    {
                        constraints  = {
                            video: {
                                facingMode: 'user'
                            },
                            audio: false
                        };
                        break;
                    }
                }
            }
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


        const video = document.querySelector('video');
        this._stream = await navigator.mediaDevices.getUserMedia(constraints);
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

        console.log('stoping instascan');
        this._stream = null;
    }

    static stop_camera()
    {
        console.log(this._stream);
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
