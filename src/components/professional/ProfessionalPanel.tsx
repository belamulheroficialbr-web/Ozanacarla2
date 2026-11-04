import {AdminPanel} from '../admin/AdminPanel';

interface ProfessionalPanelProps {
  onExitToPublic?: () => void;
}

export function ProfessionalPanel({onExitToPublic}: ProfessionalPanelProps = {}) {
  return <AdminPanel onExitToPublic={onExitToPublic} />;
}
