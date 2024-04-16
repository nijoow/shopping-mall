import CardContainer from '../../_components/CardContainer';
import UsersDatagrid from './_components/UsersDatagrid';

const AdminUsersPage = async () => (
  <CardContainer className="h-full">
    <span>Users</span>
    <UsersDatagrid />
  </CardContainer>
);

export default AdminUsersPage;
