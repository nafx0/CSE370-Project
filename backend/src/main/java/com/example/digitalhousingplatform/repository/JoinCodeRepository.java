package com.example.digitalhousingplatform.repository;

import com.example.digitalhousingplatform.model.JoinCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JoinCodeRepository extends JpaRepository<JoinCode, Integer> {

    Optional<JoinCode> findByCodeValue(String codeValue);
}