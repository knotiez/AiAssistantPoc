import { useState } from 'react';
import { MdDelete, MdPersonAdd, MdSave, MdSearch } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import './ManageUser.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const initialUsers: User[] = [
  { id: '1', name: '김철수', email: 'kim@example.com', role: '관리자' },
  { id: '2', name: '이영희', email: 'lee@example.com', role: '편집자' },
  { id: '3', name: '박민수', email: 'park@example.com', role: '뷰어' },
];

const roles = ['관리자', '편집자', '뷰어'];

export default function ManageUser() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('전체');
  const [filteredUsers, setFilteredUsers] = useState<User[]>(initialUsers);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedUsers.size === 0) return;
    const updatedUsers = users.filter(user => !selectedUsers.has(user.id));
    setUsers(updatedUsers);
    setSelectedUsers(new Set());
    setHasChanges(true);
    filterUsers(searchText, filterRole, updatedUsers);
    showNotification(`${selectedUsers.size}명의 사용자가 삭제되었습니다`, 'success');
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    );
    setUsers(updatedUsers);
    setHasChanges(true);
    filterUsers(searchText, filterRole, updatedUsers);
  };

  const handleAddUser = () => {
    navigate('/signup');
  };

  const handleSave = () => {
    showNotification('변경사항이 저장되었습니다', 'success');
    setHasChanges(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);
    filterUsers(text, filterRole);
  };

  const handleFilterRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value;
    setFilterRole(role);
    filterUsers(searchText, role);
  };

  const filterUsers = (search: string, role: string, usersToFilter?: User[]) => {
    let filtered = usersToFilter || users;
    if (search) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (role !== '전체') {
      filtered = filtered.filter(user => user.role === role);
    }
    setFilteredUsers(filtered);
  };

  return (
    <div className="manage-user-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="manage-user-card">
        {/* Header */}
        <div className="manage-user-header">
          <h1 className="manage-user-title">사용자 관리</h1>
          <p className="manage-user-subtitle">시스템 사용자 목록 및 권한 관리</p>
        </div>

        {/* Search & Filter */}
        <div className="manage-user-filter">
          <div className="search-wrapper">
            <MdSearch className="search-icon" />
            <input
              type="text"
              placeholder="이름 또는 이메일로 검색..."
              value={searchText}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <select
            value={filterRole}
            onChange={handleFilterRole}
            className="role-select"
          >
            <option value="전체">전체 역할</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="manage-user-actions">
          <button
            onClick={handleAddUser}
            className="action-button add-button"
          >
            <MdPersonAdd size={18} />
            사용자 추가
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={selectedUsers.size === 0}
            className="action-button delete-button"
          >
            <MdDelete size={18} />
            삭제 ({selectedUsers.size})
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="action-button save-button"
          >
            <MdSave size={18} />
            저장
          </button>
        </div>

        {/* Add User Form */}
        
        {/* Users Table */}
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead className="table-header">
              <tr>
                <th className="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
                      } else {
                        setSelectedUsers(new Set());
                      }
                    }}
                    className="table-checkbox"
                  />
                </th>
                <th className="table-cell name-cell">이름</th>
                <th className="table-cell email-cell">이메일</th>
                <th className="table-cell role-cell">역할</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    등록된 사용자가 없습니다
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="table-row">
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="table-checkbox"
                      />
                    </td>
                    <td className="table-cell name-cell">
                      <p className="cell-name">{user.name}</p>
                    </td>
                    <td className="table-cell email-cell">
                      <p className="cell-email">{user.email}</p>
                    </td>
                    <td className="table-cell role-cell">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="role-dropdown"
                      >
                        {roles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
