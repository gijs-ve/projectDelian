import { useEffect, useContext } from 'react';
import { Data, GameProp } from '../../../../globalUtility/types';
import { SocketContext } from '../../socket/socket';
import { useAppDispatch } from '../../hooks/hooks';
import { gameReducer } from '../../store';
import './scale.css';
import { BoxList } from '../boxes/BoxList';
import { useState } from 'react';

export function Preparing(p: GameProp) {
    const { game } = p;
    const socket = useContext(SocketContext);
    const dispatch = useAppDispatch();
    const [bombCount, setBombCount] = useState<number>(game.bombsPerPlayer);
    const [sendData, setSendData] = useState<{ bombs: number; slot: number }>({
        bombs: 1,
        slot: 0,
    });

    useEffect(() => {
        socket.on('sendRoom', (data: Data) => {
            if (!data.room) return;
            dispatch(gameReducer({ type: 'GAME_RECEIVED', game: data.room }));
            dispatch(
                gameReducer({ type: 'PHASE_CHANGE', phase: data.room.phase }),
            );
        });
        socket.on('updateBombCount', (data: Data) => {
            if (!data.bombCount) return;
            setBombCount(data.bombCount);
        });
        return () => {
            socket.off('sendRoom');
        };
    }, []);
    return (
        <div className="scale">
            <div className="w-1/2">
                <div>
                    <label>Amount of bombs ({bombCount} remaining)</label>
                    <input
                        type="number"
                        min="0"
                        max={bombCount}
                        className="text-black"
                        onChange={(e) =>
                            setSendData({ ...sendData, bombs: +e.target.value })
                        }
                        value={sendData.bombs}
                    />
                </div>
                <div>
                    <label>Slot (0-{game.livesPerBox - 1})</label>
                    <input
                        type="number"
                        className="text-black"
                        min={0}
                        max={game.livesPerBox - 1}
                        onChange={(e) =>
                            setSendData({ ...sendData, slot: +e.target.value })
                        }
                        value={sendData.slot}
                    />
                </div>
                <BoxList game={game} />
            </div>
        </div>
    );
}
