import { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import icon_close_on from 'assets/close_on.png';

const style = (theme) => (
    {
        "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": {
                borderColor: "var(--eneftigo-blue)",
                textAlign: "center",
            }
        },
    }
);

// If onLinkVerified then it's an immutable Spotify link (display-only)

export function SpotifyLink({ initialLink, onLinkVerified = null, preferredHeight = null }) {

    const [link, setLink] = useState(initialLink);
    // const [error, setError] = useState(null);
    const [embed, setEmbed] = useState(null);

    useEffect(() => {
        if (!link || link.length === 0 || !link.startsWith("https://open.spotify.com/track/")) {
            setEmbed(null);
            if (onLinkVerified)
                onLinkVerified(null);
            return;
        }
        fetch(`https://open.spotify.com/oembed?url=${link}`)
            .then((response) => {
                if (response.status !== 200)
                    throw new Error("Not a valid Spotify Link");
                return response.json();
            })
            .then((data) => {
                let updatedHtml = data.html;
                if (preferredHeight)
                    updatedHtml = data.html.replace("height=\"152\"", "height=\"" + preferredHeight + "\"");
                updatedHtml = updatedHtml.replace("utm_source=oembed", "utm_source=oembed&theme=0");
                setEmbed(updatedHtml);
                if (onLinkVerified)
                    onLinkVerified(link);
            })
            .catch((err) => {
                setEmbed(null);
                if (onLinkVerified)
                    onLinkVerified(null);
            });
    }, [link,onLinkVerified,preferredHeight]);

    if (embed) {
        return (
            <div style={{ margin: "auto", width: "300px", height: preferredHeight + "px", position: "relative" }}>
                <div
                    style={{ width: "100%", height: "100%", position: "absolute" }}
                    dangerouslySetInnerHTML={{ __html: embed }}
                />
                {
                    embed && onLinkVerified &&
                    <img
                    style={{
                        padding:"5px",
                        borderRadius: "10px",
                        backgroundColor: "var(--eneftigo-black)",
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                    }}
                    src={icon_close_on}
                    width="20"
                    height="20"
                    alt="X"
                    onMouseEnter={(e) => e.target.style.scale = 1.2}
                    onMouseLeave={(e) => e.target.style.scale = 1.0}
                    onClick={() => setLink(null)}
                />
                }
            </div>
        );
    } else {
        return (
            <div style={{ position: "absolute", width: "100%", height: "20px", margin: "auto" }}>
                <TextField
                    sx={style}
                    style={{ width: "100%" }}
                    required
                    placeholder="https://open.spotify.com/track/[TRACK_ID]"
                    onChange={(e) => setLink(e.target.value)}
                    value={link}
                    autoComplete="off"
                />
            </div>
        )
    }
}