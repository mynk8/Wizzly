import React from 'react';
import classNames from 'classnames';

export type AnimatedLogoProps = {
    connected: boolean;
    volume?: number;
};

export default function AudioPulse({ connected, volume }: AnimatedLogoProps) {
    return (
        <div
            className={classNames(
                "w-38 h-38 flex items-center justify-center transition-all duration-500",
                {
                    "animate-pulse": connected,
                    "opacity-50": !connected
                }
            )}
            style={{
                transform: connected ? `scale(${1 + (volume ? Math.min(volume / 200, 0.2) : 0)})` : 'scale(1)',
                transition: 'transform 0.3s ease-in-out'
            }}
        >

        </div>
    );
}