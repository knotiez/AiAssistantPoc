package com.ragassistant.repository;

import com.ragassistant.model.SourceDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SourceDocumentRepository extends JpaRepository<SourceDocument, Long> {
    Optional<SourceDocument> findByFilePath(String filePath);
}
