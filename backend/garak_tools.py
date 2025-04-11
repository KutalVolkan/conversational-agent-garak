"""
This script sets up a synchronous interface for invoking Garak CLI-based tools.
It provides functions for listing probes, autocompleting plugin names, describing features,
running scans via REST, and summarizing reports using Garak's native Report class.
"""

import os
import re
import glob
import subprocess
import logging
from datetime import datetime
from typing import List, Dict, Any
from garak.report import Report

from backend.config import REPORTS_DIR, LOGS_DIR, REST_CONFIG_PATH

# Configure logging
logging.basicConfig(
    level=logging.DEBUG, 
    format="%(asctime)s %(levelname)s:%(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

def strip_ansi_codes(text: str) -> str:
    """
    Remove ANSI escape sequences from the given text.
    """
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    return ansi_escape.sub('', text)

def list_probes() -> List[str]:
    """
    List all available Garak probes via the CLI.
    Returns:
        List[str]: A list of full probe/plugin names.
    Raises:
        RuntimeError: If the Garak CLI returns an error.
    """
    result = subprocess.run(
        ["garak", "--list_probes"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        env={**os.environ, "PYTHONIOENCODING": "utf-8"}
    )
    if result.returncode != 0:
        raise RuntimeError(f"Garak error: {result.stderr}")
    return [
        line.split("probes:")[-1].strip()
        for line in result.stdout.splitlines() if "probes:" in line
    ]


def autocomplete_plugin(partial: str) -> List[str]:
    """
    Return matching plugin names based on a partial input string for easier discovery.
    Args:
        partial (str): Partial string to match against available plugin names.
    Returns:
        List[str]: A list of plugin names matching the partial input.
                   If no matches are found, returns a list with an appropriate message.
    Raises:
        RuntimeError: If the Garak CLI returns an error while listing probes.
    """
    result = subprocess.run(
        ["garak", "--list_probes"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        env={**os.environ, "PYTHONIOENCODING": "utf-8"}
    )
    if result.returncode != 0:
        raise RuntimeError(f"Garak error: {result.stderr}")
    all_plugins = [
        line.split("probes:")[-1].strip()
        for line in result.stdout.splitlines() if "probes:" in line
    ]
    matches = [p for p in all_plugins if partial.lower() in p.lower()]
    return matches or [f"No matches found for '{partial}'"]


def describe_feature(name: str) -> str:
    """
    Describe a Garak probe. If the exact name is not provided,
    it tries to autocomplete based on partial input.
    Args:
        name (str): The (partial or full) name of the probe.
    Returns:
        str: Probe description or a message if not found.
    """
    # Try autocompletion first
    matches = autocomplete_plugin(name)
    
    # If no match found
    if not matches or matches[0].startswith("No matches found"):
        return f"No matching probe found for '{name}'."
    
    # Use the first match for now (could expand later to support exact or best match logic)
    full_name = matches[0]

    try:
        # For demonstration we simply return the matching probe name.
        return f"Description for probe '{full_name}' (detailed description would go here)."
    except Exception as e:
        logger.error("Error describing probe '%s': %s", full_name, e)
        return f"Error retrieving details for '{full_name}': {e}"


def scan_model_rest(
    config_file: str = REST_CONFIG_PATH,
    probes: List[str] = None,
    generations: int = 1
) -> str:
    """
    Run a Garak scan using a REST config and return the report path.
    Args:
        config_file (str): Path to the REST configuration file.
        probes (List[str], optional): A list of probe names (full identifiers). If None, the default probe set is used.
        generations (int): Number of generations to run.
    Returns:
        str: A message indicating scan completion and the path to the report.
    Raises:
        RuntimeError: If the scan fails, times out, or the report cannot be found.
    """
    # Log current working directory for debugging
    cwd = os.getcwd()
    logger.debug("Current working directory: %s", cwd)
    
    # Ensure config_file and report directory use absolute paths
    config_file = os.path.abspath(config_file)
    logger.debug("Using config file: %s", config_file)
    reports_dir = REPORTS_DIR
    os.makedirs(reports_dir, exist_ok=True)
    
    # Set report prefix as an absolute path.
    prefix = os.path.abspath(os.path.join(reports_dir, "garak_rest"))
    report_file = f"{prefix}.report.jsonl"

    if probes:
        # Clean probe names by stripping ANSI escape sequences.
        cleaned_probes = [strip_ansi_codes(p) for p in probes]
        adjusted_probes = [p.replace("probes.", "") if p.startswith("probes.") else p for p in cleaned_probes]
    else:
        adjusted_probes = None

    cmd = [
        "garak",
        "--model_type", "rest",
        "--generator_option_file", config_file,
        "--generations", str(generations),
        "--report_prefix", prefix,
        "--parallel_attempts", "4"
    ]
    if adjusted_probes:
        cmd += ["--probes", ",".join(adjusted_probes)]
    
    log_path = os.path.join(LOGS_DIR, "scan_output.log")
    try:
        with open(log_path, "w", encoding="utf-8") as log_file:
            log_file.write("Running Garak command:\n" + " ".join(cmd) + "\n")
            logger.debug("Executing command: %s", " ".join(cmd))
            try:
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
                    env={**os.environ, "PYTHONIOENCODING": "utf-8"},
                    timeout=600  # 10 minutes timeout
                )
            except subprocess.TimeoutExpired as te:
                log_file.write("\n--- TIMEOUT ---\n")
                log_file.write(f"Command timed out after {te.timeout} seconds.\n")
                raise RuntimeError(f"Scan timed out after {te.timeout} seconds. See {log_path} for details.")

            log_file.write("\n--- STDOUT ---\n" + result.stdout + "\n")
            log_file.write("\n--- STDERR ---\n" + result.stderr + "\n")
            log_file.write(f"\nExit code: {result.returncode}\n")

        if result.returncode != 0:
            raise RuntimeError(f"Scan failed with exit code {result.returncode}. See {log_path} for details.")

        # If the expected report file isn't found, try to extract it from STDOUT.
        if not os.path.exists(report_file):
            match = re.search(r"report closed.*:\s*(\S+)", result.stdout)
            if match:
                report_file = match.group(1)
                logger.debug("Extracted report file from STDOUT: %s", report_file)
                if not os.path.exists(report_file):
                    raise RuntimeError("Extracted report file path does not exist. Check scan_output.log for details.")
            else:
                raise RuntimeError("Scan completed but no report file was created. Check scan_output.log for details.")

        return f"Scan complete. Report: {report_file}"

    except Exception as e:
        with open(log_path, "a", encoding="utf-8") as log_file:
            log_file.write(f"\nException: {str(e)}\n")
        raise


def summarize_report() -> Dict[str, Any]:
    """
    Summarize the most recent Garak scan report by returning a detailed dictionary that includes:
      - "report": The file path of the latest report.
      - "config": The configuration/start record (e.g., from "start_run setup").
      - "init": The initialization record (e.g., garak_version, start_time).
      - "attempts": A list of all probe attempt records.
      - "evaluations": A list of all evaluation records.
      - "completion": The completion record (e.g., end_time).
      - "aggregated_metrics": Metrics such as total attempts, total evaluations,
                              run duration, and aggregated scores per probe.
    
    Returns:
        Dict[str, Any]: A detailed summary of the report.
    """
    report_files = glob.glob(os.path.join(REPORTS_DIR, "*.report.jsonl"))
    if not report_files:
        return {"error": "No report found."}

    latest_path = max(report_files, key=os.path.getmtime)
    report = Report(report_location=latest_path)
    logger.info("Loading report from: %s", latest_path)
    try:
        # Load the entire report (all JSONL entries)
        report.load()

        # Initialize grouping variables.
        config_record = None
        init_record = None
        completion_record = None
        attempts = []
        evals = []

        for rec in report.records:
            entry_type = rec.get("entry_type", "")
            if entry_type.startswith("start_run"):
                config_record = rec
            elif entry_type == "init":
                init_record = rec
            elif entry_type == "attempt":
                attempts.append(rec)
            elif entry_type == "eval":
                evals.append(rec)
            elif entry_type == "completion":
                completion_record = rec

        # Calculate run duration if start and end times are available.
        run_duration_seconds = None
        if init_record and completion_record:
            start_time = init_record.get("start_time")
            end_time = completion_record.get("end_time")
            try:
                start_dt = datetime.fromisoformat(start_time)
                end_dt = datetime.fromisoformat(end_time)
                run_duration_seconds = (end_dt - start_dt).total_seconds()
            except Exception as dt_ex:
                logger.error("Error computing duration: %s", dt_ex)

        # Compute aggregated scores per probe from evaluation records.
        # For each probe, sum up 'passed' and 'total' and compute a percentage score.
        probe_scores = {}
        for eval_rec in evals:
            probe = eval_rec.get("probe")
            if probe is None:
                continue
            passed = eval_rec.get("passed", 0)
            total = eval_rec.get("total", 0)
            if probe not in probe_scores:
                probe_scores[probe] = {"passed": 0, "total": 0}
            probe_scores[probe]["passed"] += passed
            probe_scores[probe]["total"] += total

        # Create a list of score summaries.
        scores_list = []
        for probe, vals in probe_scores.items():
            total = vals["total"]
            passed = vals["passed"]
            score_pct = (passed / total * 100) if total > 0 else None
            scores_list.append({
                "probe": probe,
                "passed": passed,
                "total": total,
                "score_percentage": score_pct
            })

        summary = {
            "report": latest_path,
            "config": config_record,
            "init": init_record,
            "attempts": attempts,
            "evaluations": evals,
            "completion": completion_record,
            "aggregated_metrics": {
                "total_attempts": len(attempts),
                "total_evaluations": len(evals),
                "run_duration_seconds": run_duration_seconds,
                "scores": scores_list,
            }
        }
        return summary

    except Exception as e:
        return {"error": f"Could not load or parse report: {str(e)}"}


# For testing purposes, you can run this module directly.
if __name__ == "__main__":
    try:
        # List available probes.
        print("Available probes:")
        probes = list_probes()
        for probe in probes:
            print(f"- {probe}")

        # Test the describe feature function.
        print("\nProbe description:")
        print(describe_feature("probes.promptinject.HijackKillHumansMini"))
        
        # Example of running a scan.
        scan_result = scan_model_rest(probes=["probes.lmrc.Profanity"])
        print("\nScan result:")
        print(scan_result)
        
        # Summarize the most recent report.
        summary = summarize_report()
        print("\nReport summary:")
        print(summary)

    except Exception as exc:
        logger.error("An error occurred: %s", exc)
