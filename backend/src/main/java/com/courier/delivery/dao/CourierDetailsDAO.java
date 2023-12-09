package com.courier.delivery.dao;

import com.courier.delivery.models.CourierDetails;
import com.courier.delivery.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourierDetailsDAO extends JpaRepository<CourierDetails, Long> {
    List<CourierDetails> findByAgent_Id(Long id);
    List<CourierDetails> findByAgent(User agent);
    List<CourierDetails> findByUser(User user);
}
