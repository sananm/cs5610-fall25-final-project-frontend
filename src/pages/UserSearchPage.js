import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import UserSearch from '../components/UserSearch';

function UserSearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  return (
    <Container className="main-content">
      <UserSearch initialQuery={query} />
    </Container>
  );
}

export default UserSearchPage;
