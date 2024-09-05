import React from 'react';
import './CorrectiveActionPage.css'; // Add custom CSS for design

const CorrectiveActionPage = () => {
  return (
    <div className="corrective-action-container">
      <h1 className="form-title">Corrective Action Report</h1>

      {/* Corrective Action Details */}
      <div className="section">
        <div className="row">
          <label>Corrective Action:</label>
          <input type="text" className="input-field" value="XXX" readOnly />
        </div>
        <div className="row">
          <label>Audit Station:</label>
          <input type="text" className="input-field" value="XXX" readOnly />
        </div>
        <div className="row">
          <label>Subject:</label>
          <input type="text" className="input-field" value="Audit of the Ground handler" readOnly />
        </div>
        <div className="row">
          <label>Date:</label>
          <input type="text" className="input-field" value="XXX" readOnly />
        </div>
        <div className="row">
          <label>Audited Process:</label>
          <input type="text" className="input-field" value="Ground Handling" readOnly />
        </div>
      </div>

      {/* Non-conformity and Findings */}
      <div className="section">
        <div className="row">
          <label>Non-Conformity:</label>
          <input type="checkbox" />
        </div>
        <div className="row">
          <label>Note:</label>
          <input type="checkbox" />
        </div>
        <div className="row">
          <label>Category:</label>
          <div className="radio-group">
            <label><input type="radio" name="cat" /> 1</label>
            <label><input type="radio" name="cat" /> 2</label>
            <label><input type="radio" name="cat" /> 3</label>
          </div>
        </div>
        <div className="row">
          <label>Finding:</label>
          <textarea className="textarea-field"></textarea>
        </div>
      </div>

      {/* Root Cause */}
      <div className="section">
        <div className="row">
          <label>Root Cause:</label>
          <textarea className="textarea-field"></textarea>
        </div>
      </div>

      {/* Responsable Information */}
      <div className="section">
        <div className="row">
          <label>Responsable of the Audit:</label>
          <input type="text" className="input-field" value="XXX" readOnly />
        </div>
        <div className="row">
          <label>Auditor:</label>
          <input type="text" className="input-field" value="XXX" readOnly />
        </div>
        <div className="row">
          <label>Audited:</label>
          <input type="text" className="input-field" value="XXX" readOnly />
        </div>
      </div>

      {/* Definition of Corrective Action */}
      <div className="section">
        <div className="row">
          <label>Definition of Corrective Action:</label>
          <textarea className="textarea-field"></textarea>
        </div>
        <div className="row">
          <label>Responsable:</label>
          <input type="text" className="input-field" value="XXX" readOnly />
        </div>
        <div className="row">
          <label>Deadline:</label>
          <input type="text" className="input-field" value="XXX" readOnly />
        </div>
        <div className="row">
          <label>Implementation of Corrective Action:</label>
          <textarea className="textarea-field"></textarea>
        </div>
      </div>

      {/* Closing Details */}
      <div className="section">
        <div className="row">
          <label>Responsible of the Process:</label>
          <input type="text" className="input-field" value="XXX" readOnly />
        </div>
        <div className="row">
          <label>Date:</label>
          <input type="text" className="input-field" value="XXX" readOnly />
        </div>
        <div className="row">
          <label>Close of Corrective Action:</label>
        </div>
        <div className="row">
          <label>Effectiveness Verification:</label>
          <div className="radio-group">
            <label><input type="radio" name="effectiveness" /> Satisfactory</label>
            <label><input type="radio" name="effectiveness" /> Yes</label>
            <label><input type="radio" name="effectiveness" /> No</label>
          </div>
        </div>
        <div className="row">
          <label>FAC No.:</label>
          <input type="text" className="input-field" value="XXX" readOnly />
        </div>
        <div className="row">
          <label>Commentary:</label>
          <textarea className="textarea-field"></textarea>
        </div>
        <div className="row">
          <label>Solde:</label>
        </div>
        <div className="row">
          <label>Name:</label>
          <input type="text" className="input-field" value="XXX" readOnly />
        </div>
        <div className="row">
          <label>Date:</label>
          <input type="text" className="input-field" value="XXX" readOnly />
        </div>
      </div>
    </div>
  );
};

export default CorrectiveActionPage;
