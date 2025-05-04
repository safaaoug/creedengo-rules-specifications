package org.greencodeinitiative.tools.exporter.infra;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

class PrepareResourcesTest {
	private final static Path sourceDir = Paths.get("maven-build/test/resources");

	@TempDir
	private Path targetDir;
	private PrepareResources prepareResources;

	@BeforeEach
	void setUp() {
		prepareResources = new PrepareResources(sourceDir, targetDir);
	}

	@Test
	void shouldCopyFileWhenNoMergeFile() {
		// When
		prepareResources.run();

		// Then
		assertThat(targetDir.resolve("html/GCI36.json")).exists();
		assertThat(targetDir.resolve("html/GCI36.html")).exists();
		assertThat(targetDir.resolve("javascript/GCI36.json")).exists();
		assertThat(targetDir.resolve("javascript/GCI36.html")).exists();
	}

	@Test
	void shouldThrowExceptionWhenSourceDirNotFound() {
		// Given
		Path invalid = Paths.get("not-existing-dir");
		PrepareResources pr = new PrepareResources(invalid, targetDir);

		// When
		Throwable thrown = catchThrowable(pr::run);

		// Then
		assertThat(thrown)
			.isInstanceOf(IllegalStateException.class)
			.hasMessage("Unable to read file")
			.hasCauseInstanceOf(NoSuchFileException.class)
			.hasRootCauseMessage("not-existing-dir");
	}

	@Test
	void shouldMergeJsonFilesCorrectly(@TempDir Path tempDir) throws IOException {
		// Given
		Path sourceJson = Files.createFile(tempDir.resolve("source.json"));
		Path mergeJson = Files.createFile(tempDir.resolve("merge.json"));
		Path targetJson = tempDir.resolve("result.json");

		String sourceContent = "{\n" +
			"\"key1\": \"value1\",\n" +
			"\"key2\": \"value2\"\n" +
			"}";
		String mergeContent = "{\n" +
			"\"key2\": \"newValue2\",\n" +
			"\"key3\": \"value3\"\n" +
			"}";

		Files.writeString(sourceJson, sourceContent);
		Files.writeString(mergeJson, mergeContent);

		// When
		prepareResources.mergeJsonFile(sourceJson, mergeJson, targetJson);

		// Then
		String expectedContent = "{\n" +
			"\"key1\": \"value1\",\n" +
			"\"key2\": \"newValue2\",\n" +
			"\"key3\": \"value3\"\n" +
			"}";
		assertThat(targetJson).exists();
		assertThat(Files.readString(targetJson)).isEqualToIgnoringWhitespace(expectedContent);
	}
}
