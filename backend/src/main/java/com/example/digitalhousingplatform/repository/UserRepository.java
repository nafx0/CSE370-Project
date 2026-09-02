package com.example.digitalhousingplatform.repository;

import com.example.digitalhousingplatform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    User findByEmail(String email);

    Optional<User> findByPhoneAndNID(String phone, String NID);
}
