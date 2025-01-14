import React, { useState, useEffect } from 'react';
import TableHistoire from '../components/TableHistoire';
import { periode } from '../types/DataTypes';
import { serviceHistorique } from '../services';

const Histoire: React.FC =  () => {
    
    return (
        <div className="page-histoire">
        <h1>Historique Géopolitique</h1>
            <TableHistoire />
        </div>
    );
};

export default Histoire;