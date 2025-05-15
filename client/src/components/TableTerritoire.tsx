import React,{useState,useRef} from 'react';
import { territoire } from '../types/DataTypes';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { Delete, Edit } from "@mui/icons-material";
import { TableTerritoireProps } from '../types/InterfaceTypes';
const TableTerritoire:React.FC<TableTerritoireProps> =(props) => {
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

    const saveGeoJSON = ( filename = "data.geojson") => {
        const blob = new Blob([JSON.stringify(props.territoires)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        };
    return (
        <div className="panneau-bas-historique" ref={panelRef}>
            <div className="resize-handle" onMouseDown={handleMouseDown}></div>
            <h4>Table Territoire</h4>
            <div className="upload-download-geopolitics">
            <FileUploadIcon/><DownloadIcon onClick={()=>saveGeoJSON()} /></div>
            <table className="table-territoire-historique">
                <thead>
                    <tr>
                        <th>ID période</th>
                        <th>Ville</th>
                        <th>Secteur</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {props.territoires.features.map((territoire) => (
                        territoire.properties && (
                            <tr key={territoire.properties.id_periode_geo}>
                                <td>{territoire.properties.id_periode}</td>
                                <td>{territoire.properties.ville}</td>
                                <td>{territoire.properties.secteur}</td>
                                <td><Edit/></td>
                                <td><DeleteIcon/></td>
                            </tr>
                        )
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default TableTerritoire;