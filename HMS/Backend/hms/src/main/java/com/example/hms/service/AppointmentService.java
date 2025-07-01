package com.example.hms.service;

import com.example.hms.dto.AppointmentRequest;
import com.example.hms.dto.AppointmentResponse;
import com.example.hms.dto.DoctorViewAppointmentResponse;
import com.example.hms.dto.RescheduleRequest;
import com.example.hms.entity.Appointment;
import com.example.hms.entity.Appointment.Status;
import com.example.hms.entity.Availability;
import com.example.hms.entity.Doctor;
import com.example.hms.entity.Patient;
import com.example.hms.repository.AppointmentRepository;
import com.example.hms.repository.DoctorRepository;
import com.example.hms.repository.PatientRepository;
import com.example.hms.repository.AvailabilityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AvailabilityRepository availabilityRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              DoctorRepository doctorRepository,
                              PatientRepository patientRepository,
                              AvailabilityRepository availabilityRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.availabilityRepository = availabilityRepository;
    }

    public Optional<Appointment> getAppointmentById(Long id) {
        cleanupAppointments();
        return appointmentRepository.findById(id);
    }

    public List<AppointmentResponse> getAppointmentsByPatientId(Long patientId) {
        cleanupAppointments();
        return appointmentRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DoctorViewAppointmentResponse> getDoctorAppointments(Long doctorId, Appointment.Status status) {
        cleanupAppointments();
        return appointmentRepository.findByDoctorIdAndStatus(doctorId, status).stream()
                .map(this::mapToDoctorViewResponse)
                .collect(Collectors.toList());
    }

    private DoctorViewAppointmentResponse mapToDoctorViewResponse(Appointment appt) {
        return new DoctorViewAppointmentResponse(
            appt.getAppointmentId(),
            appt.getPatient() != null ? appt.getPatient().getId() : null,
            appt.getPatient() != null ? appt.getPatient().getName() : null,
            appt.getStatus(),
            appt.getStartTime(),
            appt.getEndTime()
        );
    }

    public List<AppointmentResponse> getAvailableAppointments() {
        cleanupAppointments();
        return appointmentRepository.findByStatus(Appointment.Status.AVAILABLE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Appointment createAppointment(AppointmentRequest request) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        LocalDateTime startDateTime = request.getStartTime();
        LocalDateTime endDateTime = request.getEndTime();

        List<Appointment> existing = appointmentRepository.findByDoctorIdAndStartTimeBetween(
                doctor.getId(), startDateTime, endDateTime.minusSeconds(1));
        if (!existing.isEmpty()) {
            throw new RuntimeException("Slot already booked");
        }

        Appointment appt = new Appointment();
        appt.setDoctor(doctor);
        appt.setPatient(patient);
        appt.setStartTime(startDateTime);
        appt.setEndTime(endDateTime);
        appt.setStatus(Appointment.Status.REQUESTED);

        return appointmentRepository.save(appt);
    }

    public boolean cancelAppointment(Long appointmentId) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isEmpty()) return false;

        Appointment appointment = appointmentOpt.get();
        if (appointment.getStatus() == Appointment.Status.BOOKED || appointment.getStatus() == Appointment.Status.REQUESTED) {
            appointment.setStatus(Appointment.Status.CANCELLED);
            appointmentRepository.save(appointment);
            return true;
        }

        return false;
    }

    public boolean rescheduleAppointment(RescheduleRequest request) {
        Optional<Appointment> originalOpt = appointmentRepository.findById(request.getAppointmentId());
        if (originalOpt.isEmpty()) return false;

        Appointment original = originalOpt.get();
        if (original.getStatus() != Appointment.Status.BOOKED && original.getStatus() != Appointment.Status.REQUESTED) {
            return false;
        }

        original.setStatus(Appointment.Status.CANCELLED);
        appointmentRepository.save(original);

        Appointment newAppointment = new Appointment();
        newAppointment.setDoctor(original.getDoctor());
        newAppointment.setPatient(original.getPatient());
        newAppointment.setStartTime(request.getNewStartTime());
        newAppointment.setEndTime(request.getNewEndTime());
        newAppointment.setStatus(Appointment.Status.REQUESTED);

        appointmentRepository.save(newAppointment);
        return true;
    }

    public void cleanupAppointments() {
        LocalDateTime now = LocalDateTime.now();

        List<Appointment> bookedAppointments = appointmentRepository.findByStatus(Appointment.Status.BOOKED);
        for (Appointment appt : bookedAppointments) {
            if (appt.getEndTime().isBefore(now)) {
                appt.setStatus(Appointment.Status.COMPLETED);
                appointmentRepository.save(appt);
            }
        }

        List<Appointment> expired = appointmentRepository.findByStatusIn(List.of(
                Appointment.Status.CANCELLED,
                Appointment.Status.REQUESTED
        ));
        for (Appointment appt : expired) {
            if (appt.getEndTime().isBefore(now)) {
                appointmentRepository.delete(appt);
            }
        }
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getAppointmentId(),
                appointment.getDoctor().getName(),
                appointment.getPatient() != null ? appointment.getPatient().getName() : null,
                appointment.getStatus(),
                appointment.getStartTime(),
                appointment.getEndTime()
        );
    }

    @Transactional
    public void handleStatusUpdate(Long appointmentId, Appointment.Status newStatus) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (appointment.getStatus() != Appointment.Status.REQUESTED) {
            throw new IllegalStateException("Only REQUESTED appointments can be updated");
        }

        appointment.setStatus(newStatus);
        appointmentRepository.save(appointment);

        if (newStatus == Appointment.Status.DECLINED) {
            Doctor doctor = appointment.getDoctor();
            Availability availability = availabilityRepository.findByDoctorId(doctor.getId());

            if (availability == null) {
                throw new IllegalStateException("Availability record not found for doctor: " + doctor.getId());
            }

            availability.getUnavailableSlots().add(appointment.getStartTime());
            availabilityRepository.save(availability);
        }
    }

    @Transactional
    public void deleteAppointmentById(Long appointmentId) {
        appointmentRepository.deleteById(appointmentId);
    }

    @Transactional
    public List<DoctorViewAppointmentResponse> getCompletedAppointmentsByDoctorId(Long doctorId) {
        cleanupAppointments();
        return appointmentRepository.findCompletedByDoctorIdWithDetails(doctorId)
                .stream()
                .map(this::mapToDoctorViewResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsCompleted(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(Status.COMPLETED);
        appointmentRepository.save(appointment);
    }

    @Transactional
    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new RuntimeException("Appointment not found");
        }
        appointmentRepository.deleteById(id);
    }
}
