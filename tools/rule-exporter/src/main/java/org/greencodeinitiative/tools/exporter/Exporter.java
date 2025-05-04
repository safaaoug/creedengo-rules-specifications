/*
 * Creedengo Rule Exporter - Export all rules to JSON files usable by the website
 * Copyright © 2024 Green Code Initiative (https://green-code-initiative.org)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
package org.greencodeinitiative.tools.exporter;

import org.greencodeinitiative.tools.exporter.infra.RuleReader;
import org.greencodeinitiative.tools.exporter.infra.RuleWriter;

import java.io.IOException;

public class Exporter {

    public static void main(String[] args) {
        if (args.length != 2) {
            System.err.println("Usage: java -jar rule-exporter.jar <resourceArtifactFile> <outputJsonFile>");
            System.exit(1);
        }

        String resourceArtifactFile = args[0];
        String outputJsonFile = args[1];

        RuleReader reader = new RuleReader(resourceArtifactFile);
        RuleWriter writer = new RuleWriter(outputJsonFile);
        try {
            writer.writeRules(reader.readRules());
            System.out.println("Rules exported successfully to " + outputJsonFile);
        } catch (IOException e) {
            System.err.println("Cannot read or write rules: " + e.getMessage());
            System.exit(1);
        }
    }

}
