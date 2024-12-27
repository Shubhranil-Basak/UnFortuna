import React, { useState } from 'react';

const SlotMachine = () => {
    const [result, setResult] = useState([]);

    const spin = () => {
        const newResult = [];
        for (let i = 0; i < 3; i++) {
            newResult.push(Math.floor(Math.random() * 10));
        }
        setResult(newResult);
    };

    return (
        <div>
            <h2>Slot Machine</h2>
            <button onClick={spin}>Spin</button>
            {result.length > 0 && (
                <div>
                    {result.map((num, index) => (
                        <span key={index}>{num} </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SlotMachine;