import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceRecognition from '../../components/FaceRecognition';
import { checkIn } from '../../utils/api';

const FaceAttendance = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('choose');
  const [message, setMessage] = useState('');

  const handleFaceVerified = async () => {
    try {
      const res = await checkIn({ face_verified: true });
      setMessage('✅ ' + res.data.message);
      setStep('done');
      setTimeout(() => navigate('/intern/dashboard'), 3000);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Attendance error'));
      setStep('done');
    }
  };

  const handleFaceFailed = () => {
    setMessage('❌ Face verification failed. Attendance not marked.');
    setStep('done');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-blue-700 text-white p-6 text-center">
          <h1 className="text-2xl font-bold">📸 Face Attendance</h1>
          <p className="text-blue-200 mt-1">Verify your identity to mark attendance</p>
        </div>

        {/* Choose Step */}
        {step === 'choose' && (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-8 text-lg">
              What would you like to do?
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => setStep('register')}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 text-lg"
              >
                📸 Register My Face
                <p className="text-sm font-normal text-blue-200 mt-1">
                  First time only
                </p>
              </button>
              <button
                onClick={() => setStep('verify')}
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 text-lg"
              >
                ✅ Mark Attendance
                <p className="text-sm font-normal text-green-200 mt-1">
                  Daily check-in
                </p>
              </button>
            </div>
            <button
              onClick={() => navigate('/intern/dashboard')}
              className="mt-6 text-gray-500 hover:text-gray-700 underline"
            >
              ← Back to Dashboard
            </button>
          </div>
        )}

        {/* Register Step */}
        {step === 'register' && (
          <div>
            <div className="bg-blue-50 p-4 text-center">
              <p className="text-blue-700 font-medium">
                📸 Position your face clearly and click Register Face
              </p>
            </div>
            <FaceRecognition
              onVerified={() => {
                setMessage('✅ Face registered! Now you can mark attendance.');
                setStep('done');
              }}
              onFailed={handleFaceFailed}
            />
            <div className="p-4 text-center">
              <button
                onClick={() => setStep('choose')}
                className="text-gray-500 hover:text-gray-700 underline"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Verify Step */}
        {step === 'verify' && (
          <div>
            <div className="bg-green-50 p-4 text-center">
              <p className="text-green-700 font-medium">
                ✅ Look at the camera and click Verify Face
              </p>
            </div>
            <FaceRecognition
              onVerified={handleFaceVerified}
              onFailed={handleFaceFailed}
            />
            <div className="p-4 text-center">
              <button
                onClick={() => setStep('choose')}
                className="text-gray-500 hover:text-gray-700 underline"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Done Step */}
        {step === 'done' && (
          <div className="p-8 text-center">
            <div className={`text-6xl mb-4 ${message.startsWith('✅') ? '' : ''}`}>
              {message.startsWith('✅') ? '🎉' : '😢'}
            </div>
            <p className={`text-lg font-semibold mb-6 ${
              message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
            }`}>
              {message}
            </p>
            {message.startsWith('✅') && (
              <p className="text-gray-500 text-sm">
                Redirecting to dashboard...
              </p>
            )}
            <button
              onClick={() => navigate('/intern/dashboard')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceAttendance;