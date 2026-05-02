import { getLevelInfo } from '../constants/levels';
import './ReportCard.css';

function ReportCard({ report, onClose }) {
    return (
        <div className="report-card-overlay" onClick={onClose}>
            <div className="report-card" onClick={(e) => e.stopPropagation()}>
                <button className="report-card-close" onClick={onClose}>×</button>
                
                <div className="report-card-header">
                    <div 
                        className="report-card-dot" 
                        style={{ backgroundColor: getLevelInfo(report.trashLevel).color }}
                    />
                    <span className="report-card-title">
                        {getLevelInfo(report.trashLevel).text}
                    </span>
                </div>

                {report.address && (
                    <div className="report-card-address">📍 {report.address}</div>
                )}

                {report.photoUrl && (
                    <div className="report-card-photo">
                        <img src={report.photoUrl} alt="Фото загрязнения" />
                    </div>
                )}

                {report.comment && (
                    <div className="report-card-comment">{report.comment}</div>
                )}

                <div className="report-card-date">
                    {report.createdAt?.toDate 
                        ? report.createdAt.toDate().toLocaleDateString('ru-RU') 
                        : ''}
                </div>
            </div>
        </div>
    );
}

export default ReportCard;
