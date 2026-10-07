import { Contact } from '../data/contacts';

const AdminContacts: React.FC = () => {
  return (
    <div>
      <h1 className="page-title">Contacts</h1>
      <p className="page-description">Manage site contact submissions.</p>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Contact.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.subject}</td>
                <td>{new Date(c.date).toLocaleDateString('en-GB')}</td>
                <td>
                  <span className="badge badge-primary">{c.status}</span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-sm btn-outline btn-delete">
                      Reply
                    </button>
                    <button className="btn btn-sm btn-outline btn-delete">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminContacts;
