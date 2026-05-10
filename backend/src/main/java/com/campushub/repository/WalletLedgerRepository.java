package com.campushub.repository;

import com.campushub.domain.WalletLedger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.math.BigDecimal;
import java.util.Optional;

import java.util.List;

public interface WalletLedgerRepository extends MongoRepository<WalletLedger, String> {

    Page<WalletLedger> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    @Query(value = "{ 'userId': ?0 }", sort = "{ 'createdAt': -1 }")
    List<WalletLedger> findLatestBalances(String userId, Pageable pageable);

    default Optional<BigDecimal> findLatestBalance(String userId) {
        return findLatestBalances(userId, org.springframework.data.domain.PageRequest.of(0, 1))
                .stream()
                .findFirst()
                .map(WalletLedger::getBalanceAfter);
    }
}




