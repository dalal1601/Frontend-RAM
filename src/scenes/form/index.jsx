import React, { useEffect, useState } from 'react';
import './CorrectiveActionPage.css';
import { useParams } from 'react-router-dom'; // Import useParams for URL params

const CorrectiveActionForm = () => {
  const [isAuditee, setIsAuditee] = useState(false);
  const [rules, setRules] = useState([]);
  const [auditData, setAuditData] = useState(null);
  const { userId } = useParams(); // Get user ID from URL params

  useEffect(() => {
    const fetchAuditDetails = async () => {
      if (!userId) {
        console.error('User ID is undefined');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          return;
        }

        // Fetch audit details
        const auditResponse = await fetch(`http://localhost:8080/Audit/audite/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!auditResponse.ok) {
          const errorText = await auditResponse.text();
          console.error('Fetch failed:', errorText);
          throw new Error('Network response was not ok');
        }

        const auditData = await auditResponse.json();
        console.log('Fetched Audit Data:', auditData);

        if (auditData && Array.isArray(auditData) && auditData.length > 0) {
          const audit = auditData.find(a => a.audite && a.audite.id === userId);

          if (audit) {
            setIsAuditee(true);
            setAuditData(audit);

            // Fetch responses for the audit
            if (audit.id) {
              const responseResponse = await fetch(`http://localhost:8080/Reponse/audit/${audit.id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (!responseResponse.ok) {
                const errorText = await responseResponse.text();
                console.error('Fetch failed:', errorText);
                throw new Error('Network response was not ok');
              }

              const responsesData = await responseResponse.json();
              console.log('Fetched Responses Data:', responsesData);

              // Access responses array from the responsesData object
              if (responsesData && Array.isArray(responsesData.reponses)) {
                // Filter out rules where value is 'CONFORME'
                const filteredRules = responsesData.reponses.filter(rule => rule.value !== 'CONFORME');
                setRules(filteredRules);
              } else {
                console.error('Responses data is not in the expected format:', responsesData);
                setRules([]); // Reset rules to empty array if data is not in expected format
              }
            }
          } else {
            console.log('No matching audit data found for this user.');
            setIsAuditee(false);
          }
        } else {
          console.log('Audit data is empty or not in expected format.');
          setIsAuditee(false);
        }
      } catch (error) {
        console.error('Error fetching audit details:', error);
      }
    };

    fetchAuditDetails();
  }, [userId]);

  if (!userId) {
    return <div>User ID is not available.</div>;
  }

  if (!isAuditee) {
    return <div>You are not authorized to view this form.</div>;
  }

  return (
    <div className="corrective-action-form">
      <h2>Hi, here is your corrective action form</h2>
      {Array.isArray(rules) && rules.length === 0 ? (
        <p>No rules available for this audit.</p>
      ) : (
        rules.map((rule, index) => (
          <div key={rule.regle._id} className="form-section">
            <h3>Form</h3>
            <table className="form-table">
              <tbody>
                <tr>
                  <td> <strong style={{ color: 'darkred' }}>Corrective action:</strong> N° {index + 1} </td>
                  <td> <strong style={{ color: 'darkred' }}>Audit Station:</strong> {auditData?.escaleVille || 'XXX'}</td>
                </tr>
                <tr>
                  <td> <strong style={{ color: 'darkred' }}>Subject: </strong>Audit of the Ground handler:</td>
                  <td> <strong style={{ color: 'darkred' }}>Date:</strong> {auditData?.dateDebut || 'XXX'}</td>
                </tr>
                <tr>
                  <td colSpan="2"><strong style={{ color: 'darkred' }}>Audited Process:</strong> Ground Handling</td>
                </tr>
                <tr>
                  <td><strong style={{ color: 'darkred' }}>Non-Conformity:</strong> <input type="checkbox" checked={rule.value === 'NON_CONFORME'} readOnly /></td>
                  <td> <strong style={{ color: 'darkred' }}>Note:</strong>
                    <input type="checkbox" checked={rule.value === 'OBSERVATION' || rule.value === 'AMELIORATION'} readOnly />
                    <strong style={{ color: 'darkred' }}>CAT: </strong>
                    <input type="checkbox" checked={rule.nonConformeLevel === 1} readOnly /> 1
                    <input type="checkbox" checked={rule.nonConformeLevel === 2} readOnly /> 2
                    <input type="checkbox" checked={rule.nonConformeLevel === 3} readOnly /> 3
                  </td>
                </tr>
                <tr>
                  <td colSpan="2">
                    <strong style={{ color: 'darkred' }}>Finding:</strong>
                    <textarea rows="3" defaultValue={rule.commentaire || ''} />
                  </td>
                </tr>
                <tr>
                  <td colSpan="2">
                    <strong style={{ color: 'darkred' }}>Root Cause:</strong>
                    <textarea rows="3" /></td>
                </tr>
                <tr>
                  <td colSpan="2"> <strong style={{ color: 'darkred' }}>Responsible of the Audit: </strong></td>
                </tr>
                <tr>
                  <td><strong>Auditor:</strong> {auditData?.auditeur.fullname || 'XXX'}</td>
                  <td><strong>Audited:</strong> {auditData?.audite.fullname || 'XXX'}</td>
                </tr>
                <tr>
                  <td colSpan="2"><strong style={{ color: 'darkred' }}>Definition of Corrective Action: </strong><textarea rows="3" defaultValue={rule.regle.actionCorrective|| ''} readOnly /></td>
                </tr>
                <tr>
                  <td><strong style={{ color: 'darkred' }}>Responsable:</strong> <textarea rows="1" /></td>
                  <td>
                    <strong style={{ color: 'darkred' }}>Deadline:</strong>
                    <input type="date" />
                  </td>
                </tr>
                <tr>
                  <td colSpan="2"><strong style={{ color: 'darkred' }}>Implementation of the Corrective Action:</strong><textarea rows="3" /></td>
                </tr>
                <tr>
                  <td><strong style={{ color: 'darkred' }}>Responsible of the Processus:</strong><textarea rows="1" /></td>
                  <td>
                    <strong style={{ color: 'darkred' }}>Date:</strong>
                    <input type="date" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default CorrectiveActionForm;
