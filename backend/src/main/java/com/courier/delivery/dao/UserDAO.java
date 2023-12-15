package com.courier.delivery.dao;

import com.courier.delivery.enums.UserRoleEnum;
import com.courier.delivery.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDAO extends JpaRepository<User, Long> {
    List<User> findByRole(UserRoleEnum role);
    Optional<User> findUserByEmail(String email);
    Boolean existsByEmail(String email);
    Boolean existsByEmailAndActive(String email, Boolean active);
    Page<User> findAllByRole(UserRoleEnum role, Pageable pageable);
    Page<User> findAllByActiveAndRole(Boolean active, UserRoleEnum role, Pageable pageable);
}
