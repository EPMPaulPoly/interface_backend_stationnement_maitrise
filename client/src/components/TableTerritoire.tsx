import React,{useState,useRef} from 'react';
import { territoire } from '../types/DataTypes';

const TableTerritoire:React.FC<{}> =() => {
    const[etatTerritoire,defTerritoire] = useState<territoire[]>([]);
    const panelRef = useRef<HTMLDivElement>(null);
    const handleMouseDown = (e: React.MouseEvent) => {
            const startY = e.clientY;
            const startHeight = panelRef.current ? panelRef.current.offsetHeight : 0;
    
            const handleMouseMove = (e: MouseEvent) => {
                const newHeight = startHeight + (startY - e.clientY);
                if (panelRef.current) {
                    panelRef.current.style.height = `${newHeight}px`;
                }
            };
    
            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
    
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };

    return (
        <div className="panneau-bas-historique" ref={panelRef}>
            <div className="resize-handle" onMouseDown={handleMouseDown}></div>
            <h4>Table Territoire</h4>
            <table className="table-territoire-historique">
                <thead>
                    <tr>
                        <th>ID période</th>
                        <th>Ville</th>
                        <th>Secteur</th>
                    </tr>
                </thead>
                <tbody>
                    {etatTerritoire.map((territoire) => (
                        <tr key={territoire.id}>
                            <td>{territoire.id_periode}</td>
                            <td>{territoire.ville}</td>
                            <td>{territoire.secteur}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default TableTerritoire;