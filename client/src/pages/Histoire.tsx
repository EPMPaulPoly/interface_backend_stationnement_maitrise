import React, { useState, useEffect } from 'react';
import TableHistoire from '../components/TableHistoire';
import { periode } from '../types/DataTypes';
import { serviceHistorique } from '../services';

const Histoire: React.FC =  () => {
    const [etat_periodes, setPeriodes] = useState<periode[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ResPeriodes = await serviceHistorique.getAll();
                console.log('Recu les périodes', ResPeriodes);
                setPeriodes(ResPeriodes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Empty dependency array means this runs once when the component mounts

    if (loading) {
        return <div>Loading...</div>; // You can show a loading state while waiting for the data
    }
    return (
        <div className="page-histoire">
        <h1>Historique Géopolitique</h1>
            <TableHistoire 
                periodes = {etat_periodes}
            />
        </div>
    );
};

export default Histoire;